import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import prisma from '../../../../lib/db/prisma'
import { computeContentHash } from '../../../../lib/hash'
import { deriveSourceIdentifiers } from '../../../../lib/sourceIdentifiers'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { deviceId, pmid, title, sourceUrl } = req.body
  if (!deviceId || !pmid || !title) return res.status(400).json({ error: 'missing fields' })
  // Device.id is String (cuid) in prisma/schema.prisma -> keep deviceId as string

  try {
    const contentHash = computeContentHash(`pubmed:${pmid}:${title}`)
    const identifiers = deriveSourceIdentifiers({
      sourceName: 'PubMed',
      sourceId: String(pmid),
      sourceUrl: sourceUrl || null,
      title: String(title),
    })
    const dup = await prisma.reference.findFirst({ where: { deviceId, sourceName: 'PubMed', sourceId: pmid }, select: { id: true } })
    if (dup) return res.status(409).json({ error: 'duplicate', referenceId: dup.id })
    const identifierOr = [
      ...(identifiers.pmid ? [{ pmid: identifiers.pmid }] : []),
      ...(identifiers.doi ? [{ doi: identifiers.doi }] : []),
      ...(identifiers.arxivId ? [{ arxivId: identifiers.arxivId }] : []),
      ...(identifiers.sourceFingerprint ? [{ sourceFingerprint: identifiers.sourceFingerprint }] : []),
    ]
    if (identifierOr.length > 0) {
      const dupIdentifiers = await prisma.reference.findFirst({
        where: {
          deviceId,
          OR: identifierOr,
        },
        select: { id: true },
      })
      if (dupIdentifiers) return res.status(409).json({ error: 'duplicate source identifiers', referenceId: dupIdentifiers.id })
    }
    const dupHash = await prisma.reference.findFirst({ where: { deviceId, contentHash }, select: { id: true } })
    if (dupHash) return res.status(409).json({ error: 'duplicate content', referenceId: dupHash.id })

    const ref = await prisma.reference.create({
      data: {
        deviceId,
        title,
        sourceName: 'PubMed',
        sourceId: pmid,
        pmid: identifiers.pmid || undefined,
        doi: identifiers.doi || undefined,
        arxivId: identifiers.arxivId || undefined,
        sourceFingerprint: identifiers.sourceFingerprint || undefined,
        sourceUrl: sourceUrl || undefined,
        sourceReliabilityScore: 0.0,
        contentHash,
      },
    })

    return res.status(201).json({ referenceId: ref.id })
  } catch (e: any) {
    if (String(e?.code || '') === 'P2002') {
      const existing = await prisma.reference.findFirst({
        where: {
          deviceId,
          OR: [
            { contentHash: computeContentHash(`pubmed:${pmid}:${title}`) },
            ...(pmid ? [{ pmid: String(pmid).trim().toLowerCase() }] : []),
          ],
        },
        select: { id: true },
      })
      return res.status(409).json({ error: 'duplicate', referenceId: existing?.id || null })
    }
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}

export default withAdminAuth(handler)

