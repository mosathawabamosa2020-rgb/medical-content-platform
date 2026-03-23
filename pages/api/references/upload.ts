import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import pdf from 'pdf-parse'
import { getServerSession } from 'next-auth/next'
import prisma from '../../../lib/db/prisma'
import logger from '../../../lib/logger'
import { enforceCsrfForMutation, enforceRateLimit, setSecurityHeaders } from '../../../lib/apiSecurity'
import { computeContentHash } from '../../../lib/hash'
import { deriveSourceIdentifiers } from '../../../lib/sourceIdentifiers'
import authOptions from '../../../lib/auth'
import { resolveMinioBucket, storeBuffer } from '../../../lib/storage/storage.adapter'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setSecurityHeaders(res)
  if (!enforceRateLimit(req, res, 'references-upload', 60_000, 45)) return
  if (!enforceCsrfForMutation(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions as any)) as any
  if (!session || !['ADMIN', 'EDITOR', 'admin', 'editor'].includes(String(session?.user?.role || ''))) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!session?.user?.id) return res.status(401).json({ error: 'Unauthorized' })
  if (!enforceRateLimit(req, res, `references-upload-user-${session.user.id}`, 60 * 60 * 1000, 30)) return

  const form = formidable({ multiples: false })
  return await new Promise<void>((resolve) => {
    form.parse(req as any, async (err: unknown, fields: any, files: any) => {
      try {
        if (err) {
          res.status(500).json({ error: 'Upload error' })
          return resolve()
        }
        const deviceId = fields.deviceId as string
        if (!deviceId) {
          res.status(400).json({ error: 'deviceId required' })
          return resolve()
        }

        const file = files.file as any
        if (!file) {
          res.status(400).json({ error: 'file required' })
          return resolve()
        }

        const maxBytes = 25 * 1024 * 1024
        const mimeType = String(file.mimetype || '').toLowerCase()
        if (mimeType !== 'application/pdf') {
          res.status(400).json({ error: 'only application/pdf is accepted' })
          return resolve()
        }
        if (Number(file.size || 0) <= 0 || Number(file.size || 0) > maxBytes) {
          res.status(400).json({ error: 'file size must be between 1B and 25MB' })
          return resolve()
        }

        const data = fs.readFileSync(file.filepath)
        const pdfData = await pdf(data)
        const text = pdfData.text || ''
        const binaryContentHash = computeContentHash(data.toString('base64'))
        const extractedTextHash = computeContentHash(text)

        const pages: string[] = []
        if ((pdfData as any).numpages) {
          const splitted = text.split('\f')
          for (const p of splitted) pages.push(p.trim())
        } else {
          for (let i = 0; i < text.length; i += 1500) pages.push(text.slice(i, i + 1500))
        }

        const filename = `ref_upload_${Date.now()}.pdf`

        const sourceUrl = (fields.sourceUrl as string) || null
        const sourceName = (fields.sourceName as string) || null
        const sourceId = (fields.sourceId as string) || null
        const identifiers = deriveSourceIdentifiers({
          sourceUrl,
          sourceName,
          sourceId,
          title: (fields.title as string) || filename,
        })

        const identifierOr = [
          ...(identifiers.pmid ? [{ pmid: identifiers.pmid }] : []),
          ...(identifiers.doi ? [{ doi: identifiers.doi }] : []),
          ...(identifiers.arxivId ? [{ arxivId: identifiers.arxivId }] : []),
          ...(identifiers.sourceFingerprint ? [{ sourceFingerprint: identifiers.sourceFingerprint }] : []),
        ]
        if (identifierOr.length > 0) {
          const duplicateByIdentifiers = await prisma.reference.findFirst({
            where: { deviceId, OR: identifierOr },
            select: { id: true },
          })
          if (duplicateByIdentifiers) {
            await prisma.ingestionLog.create({ data: { message: 'upload duplicate by identifiers', referenceId: duplicateByIdentifiers.id } })
            res.status(409).json({ error: 'duplicate source identifiers', referenceId: duplicateByIdentifiers.id })
            return resolve()
          }
        }

        const existing = await prisma.reference.findFirst({
          where: {
            deviceId,
            OR: [{ contentHash: binaryContentHash }, { contentHash: extractedTextHash }],
          },
          select: { id: true },
        })
        if (existing) {
          await prisma.ingestionLog.create({ data: { message: 'upload duplicate by content', referenceId: existing.id } })
          res.status(409).json({ error: 'duplicate reference content', referenceId: existing.id })
          return resolve()
        }

        const ref = await prisma.reference.create({
          data: {
            deviceId,
            title: (fields.title as string) || filename,
            filePath: null,
            pageCount: pages.length,
            parsedText: text.substring(0, 2000),
            contentHash: binaryContentHash,
            sourceUrl: sourceUrl || undefined,
            sourceName: sourceName || undefined,
            sourceId: sourceId || undefined,
            doi: identifiers.doi || undefined,
            pmid: identifiers.pmid || undefined,
            arxivId: identifiers.arxivId || undefined,
            sourceFingerprint: identifiers.sourceFingerprint || undefined,
          },
        })

        // Durable write happens after dedup and DB create to avoid orphaned-file drift.
        try {
          const stored = await storeBuffer({
            bucket: resolveMinioBucket('references'),
            key: `${ref.id}.pdf`,
            buffer: data,
            contentType: 'application/pdf',
          })
          await prisma.reference.update({
            where: { id: ref.id },
            data: { filePath: stored.filePath },
          })
        } catch (e: unknown) {
          await prisma.reference.delete({ where: { id: ref.id } }).catch(() => null)
          throw e
        }

        await prisma.ingestionLog.create({
          data: {
            referenceId: ref.id,
            message: `upload accepted; textHash=${extractedTextHash}; embedding deferred to worker`,
          },
        })

        const updated = await prisma.reference.findUnique({ where: { id: ref.id } })
        res.status(201).json({ reference: updated || ref, indexedPages: 0, embeddingMode: 'chunk-first-deferred' })
        return resolve()
      } catch (e: unknown) {
        const code = String((e as any)?.code || '')
        if (code === 'P2002') {
          res.status(409).json({ error: 'duplicate reference' })
          return resolve()
        }
        logger.error(e)
        res.status(500).json({ error: 'Parsing/indexing failed' })
        return resolve()
      }
    })
  })
}
