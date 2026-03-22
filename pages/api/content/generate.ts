import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'
import prisma from '../../../lib/db/prisma'
import { enforceCsrfForMutation, enforceRateLimit, setSecurityHeaders } from '../../../lib/apiSecurity'
import { runRetrievalQuery } from '../../../lib/services/retrieval'
import { embedText } from '../../../lib/embeddings'
import { buildGeneratedContent } from '../../../lib/services/contentGeneration'
import type { GenerateContentInput, GeneratedContentResponse } from '../../../lib/contracts/api'
import logger from '../../../lib/logger'
import { writeAuditEvent } from '../../../lib/auditTrail'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setSecurityHeaders(res)
  if (!enforceRateLimit(req, res, 'content-generate-ip', 60_000, 30)) return
  if (!enforceCsrfForMutation(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions as any)) as any
  if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' })
  if (!enforceRateLimit(req, res, `content-generate-user-${session.user.id}`, 60 * 60 * 1000, 20)) return

  const body = req.body as GenerateContentInput
  if (!body?.topic || !body?.tone || !body?.platform) {
    return res.status(400).json({ error: 'topic, tone and platform are required' })
  }
  if (!['facebook', 'instagram', 'x'].includes(body.platform)) {
    return res.status(400).json({ error: 'invalid platform' })
  }
  if (body.contentType && !['generic', 'scientific_device'].includes(body.contentType)) {
    return res.status(400).json({ error: 'invalid contentType' })
  }

  const start = Date.now()
  try {
    const topKUsed = 12
    const retrievalStart = Date.now()
    const retrieval = await runRetrievalQuery(
      { query: body.topic, topK: topKUsed, page: 1 },
      { prisma, embedder: embedText, logger }
    )
    const retrievalLatencyMs = Date.now() - retrievalStart

    const generated = await buildGeneratedContent(body, retrieval.results)
    const generationLatencyMs = Date.now() - start
    const tokenUsageInput = Math.min(3000, Math.ceil((body.topic.length + retrieval.results.map((r) => r.snippet.length).join('').length) / 4))
    const tokenUsageOutput = Math.ceil((generated.script.length + generated.caption.length + generated.voiceoverText.length) / 4)
    const generationCostEstimate = Number(((tokenUsageInput + tokenUsageOutput) * 0.000001).toFixed(6))

    const created = await prisma.generatedContent.create({
      data: {
        userId: session.user.id,
        contentType: generated.contentType,
        topic: body.topic,
        tone: body.tone,
        platform: body.platform,
        script: generated.script,
        caption: generated.caption,
        hashtags: generated.hashtags,
        voiceoverText: generated.voiceoverText,
        imageSourceUrl: generated.imageSourceUrl,
        imagePrompt: generated.imagePrompt,
        generationCostEstimate,
        tokenUsageInput,
        tokenUsageOutput,
        generationLatencyMs,
        retrievalLatencyMs,
        topKUsed,
        probeUsed: Number(retrieval.meta.probeUsed || 0),
        failureCode: generated.failureCode,
        retryCount: 0,
        references: {
          create: generated.references.map((referenceId) => ({ referenceId })),
        },
      },
    })

    await prisma.contentDraft.create({
      data: {
        generatedContentId: created.id,
        draftJson: JSON.stringify({
          script: generated.script,
          caption: generated.caption,
          hashtags: generated.hashtags,
          voiceoverText: generated.voiceoverText,
          imageSourceUrl: generated.imageSourceUrl,
          imagePrompt: generated.imagePrompt,
          contentType: generated.contentType,
          reelTimestampBreakdown: generated.reel?.breakdown || null,
          citationTrace: generated.citationTrace || [],
        }),
        version: 1,
      },
    })

    if (generated.reel) {
      await prisma.reelScript.create({
        data: {
          generatedContentId: created.id,
          durationSec: generated.reel.durationSec,
          scriptText: generated.reel.text,
          timestampBreakdown: JSON.stringify(generated.reel.breakdown),
        },
      })
    }

    const out: GeneratedContentResponse = {
      id: created.id,
      contentType: created.contentType,
      topic: created.topic,
      tone: created.tone,
      platform: created.platform,
      script: created.script,
      caption: created.caption,
      hashtags: created.hashtags,
      voiceoverText: created.voiceoverText,
      imageSourceUrl: created.imageSourceUrl,
      imagePrompt: created.imagePrompt,
      topKUsed: created.topKUsed,
      probeUsed: created.probeUsed,
      reelTimestampBreakdown: generated.reel?.breakdown || undefined,
      citationTrace: generated.citationTrace || [],
      generationCostEstimate: created.generationCostEstimate,
      tokenUsageInput: created.tokenUsageInput,
      tokenUsageOutput: created.tokenUsageOutput,
      generationLatencyMs: created.generationLatencyMs,
      retrievalLatencyMs: created.retrievalLatencyMs,
    }

    logger.info(
      {
        event: 'content.generate',
        generatedContentId: created.id,
        contentType: created.contentType,
        retrievalLatencyMs,
        generationLatencyMs,
        tokenUsageInput,
        tokenUsageOutput,
        topKUsed,
        probeUsed: Number(retrieval.meta.probeUsed || 0),
        failureCode: generated.failureCode,
        retryCount: 0,
      },
      'content generation completed'
    )
    writeAuditEvent({
      event: 'content.generated',
      actorId: String(session?.user?.id || ''),
      entityType: 'generatedContent',
      entityId: created.id,
      payload: {
        contentType: created.contentType,
        topKUsed,
        probeUsed: Number(retrieval.meta.probeUsed || 0),
        failureCode: generated.failureCode,
      },
    })

    return res.status(201).json(out)
  } catch (err: unknown) {
    logger.error({ err }, 'content generation failed')
    return res.status(500).json({ error: 'generation failed' })
  }
}
