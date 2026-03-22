import prisma from '../db/prisma'
import PubMedAdapter from '../sources/pubmed.adapter'
import { assertTransition } from '../referenceState'
import logger from '../logger'
import { embedText } from '../embeddings'

async function parseTextIntoSections(text: string): Promise<{ title: string; content: string }[]> {
  if (!text) return []
  // naive split by double newlines; each paragraph becomes a section
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  return paras.map((p, i) => ({ title: `Section ${i + 1}`, content: p }))
}

async function logEvent(message: string, referenceId?: string) {
  try {
    await prisma.ingestionLog.create({ data: { message, referenceId } })
  } catch (e) {
    logger.error({ err: e, referenceId }, 'failed to write ingestion log')
  }
}

async function moveProcessingToPendingReview(referenceId: string) {
  await prisma.reference.update({ where: { id: referenceId }, data: { status: 'processed' } })
  assertTransition('processing', 'processed')
  await prisma.reference.update({ where: { id: referenceId }, data: { status: 'pending_review', processingDate: new Date() } })
  assertTransition('processed', 'pending_review')
}

export async function runIngestionWorker() {
  await logEvent('Started worker run')
  // find references pending ingestion
  const refs = await prisma.reference.findMany({ where: { status: 'pending_ingestion' } })
  for (const r of refs) {
    await logEvent(`Processing reference ${r.id}`, r.id)
    // mark as processing to prevent double-work
    await prisma.reference.update({ where: { id: r.id }, data: { status: 'processing' } })
    try {
      let fullText: string | null = null
      if ((r as any).sourceName === 'PubMed') {
        const adapter = new PubMedAdapter()
        fullText = await adapter.fetchFullText((r as any).sourceId)
      }

      if (fullText) {
        if (typeof (prisma.section as any).deleteMany === 'function') {
          await (prisma.section as any).deleteMany({ where: { referenceId: r.id } })
        }
        const sections = await parseTextIntoSections(fullText)
        let order = 1
        for (const s of sections) {
          let embeddingLiteral: string | null = null
          try {
            const sectionEmbedding = await embedText(s.content)
            embeddingLiteral = `[${sectionEmbedding.join(',')}]`
          } catch (e) {
            logger.warn({ err: e, referenceId: r.id, order }, 'section embedding generation failed')
          }
          await prisma.section.create({ data: {
            deviceId: r.deviceId,
            referenceId: r.id,
            title: s.title,
            content: s.content,
            order: order++,
            ...(embeddingLiteral ? { embedding: embeddingLiteral as any } : {})
          } })
        }
      }
      // official lifecycle: processing -> processed -> pending_review
      await moveProcessingToPendingReview(r.id)
      await logEvent(`Finished processing reference ${r.id}`, r.id)
    } catch (e: any) {
      logger.error({ err: e, referenceId: r.id }, 'worker error for reference')
      // errors also send to pending_review so human can inspect
      await moveProcessingToPendingReview(r.id)
      await logEvent(`Error processing reference ${r.id}: ${e?.message}`, r.id)
    }
  }
}

export async function processIngestionQueue() {
  return runIngestionWorker()
}

const ingestionWorker = { processIngestionQueue, runIngestionWorker }

export default ingestionWorker

export async function processReferenceById(referenceId: string) {
  const r = await prisma.reference.findUnique({ where: { id: referenceId } })
  if (!r) throw new Error('not found')
  // reuse logic for single reference
  try {
    await prisma.reference.update({ where: { id: r.id }, data: { status: 'processing' } })
    assertTransition(r.status as any, 'processing')
    let fullText: string | null = null
    if ((r as any).sourceName === 'PubMed') {
      const adapter = new PubMedAdapter()
      fullText = await adapter.fetchFullText((r as any).sourceId)
    }

    if (fullText) {
      if (typeof (prisma.section as any).deleteMany === 'function') {
        await (prisma.section as any).deleteMany({ where: { referenceId: r.id } })
      }
      const sections = await parseTextIntoSections(fullText)
      let order = 1
      for (const s of sections) {
        let embeddingLiteral: string | null = null
        try {
          const sectionEmbedding = await embedText(s.content)
          embeddingLiteral = `[${sectionEmbedding.join(',')}]`
        } catch (e) {
          logger.warn({ err: e, referenceId: r.id, order }, 'section embedding generation failed')
        }
        await prisma.section.create({ data: {
          deviceId: r.deviceId,
          referenceId: r.id,
          title: s.title,
          content: s.content,
          order: order++,
          ...(embeddingLiteral ? { embedding: embeddingLiteral as any } : {})
        } })
      }
    }
    await moveProcessingToPendingReview(r.id)
    return { status: 'pending_review', sections: fullText ? fullText.split(/\n\s*\n/).length : 0 }
  } catch (e: any) {
    await moveProcessingToPendingReview(r.id)
    throw e
  }
}


