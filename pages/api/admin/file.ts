import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import { withAdminAuth } from '../../../lib/adminAuth'
import prisma from '../../../lib/prisma'
import logger from '../../../lib/logger'
import { getObjectStream, isMinioEnabled, resolveMinioBucket, storeBuffer } from '../../../lib/storage/storageAdapter'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const name = req.query.name
    if (typeof name !== 'string') return res.status(400).end()
    if (name.startsWith('minio://') && isMinioEnabled()) {
      const without = name.replace('minio://', '')
      const slash = without.indexOf('/')
      const bucket = slash >= 0 ? without.slice(0, slash) : resolveMinioBucket('references')
      const key = slash >= 0 ? without.slice(slash + 1) : without
      const stream = await getObjectStream({ bucket, key })
      if (!stream) return res.status(404).end()
      res.setHeader('Content-Type', 'application/octet-stream')
      ;(stream as any).pipe(res)
      return
    }

    const uploadsDir = path.join(process.cwd(), 'uploads')
    const safeName = path.basename(name)
    const full = path.join(uploadsDir, safeName)
    if (!fs.existsSync(full)) return res.status(404).end()
    res.setHeader('Content-Type', 'application/pdf')
    const stream = fs.createReadStream(full)
    stream.pipe(res)
    return
  }

  if (req.method === 'POST') {
    const form = formidable({ multiples: false })
    return form.parse(req as any, async (err: unknown, fields: any, files: any) => {
      if (err) return res.status(400).json({ error: 'invalid form data' })
      const deviceId = fields.deviceId as string | undefined
      if (!deviceId) return res.status(400).json({ error: 'deviceId required' })
      const file = files.file as any
      if (!file) return res.status(400).json({ error: 'file required' })

      const safeName = `${Date.now()}_${path.basename(file.originalFilename || 'upload.bin')}`

      try {
        const data = fs.readFileSync(file.filepath)
        const stored = await storeBuffer({
          bucket: resolveMinioBucket('references'),
          key: safeName,
          buffer: data,
          contentType: file.mimetype || 'application/octet-stream',
        })
        const created = await prisma.$transaction(async (tx) => {
          const dbFile = await tx.file.create({
            data: {
              filename: safeName,
              mimeType: file.mimetype || 'application/octet-stream',
              path: stored.filePath,
              sizeBytes: Number(file.size || 0),
            },
          })
          const reference = await tx.reference.create({
            data: {
              deviceId,
              title: (fields.title as string) || safeName,
              filePath: stored.filePath,
              fileId: dbFile.id,
              status: 'pending_ingestion',
            },
          })
          await tx.auditLog.create({
            data: {
              referenceId: reference.id,
              actorId: null,
              action: 'admin.file.uploaded',
              payload: JSON.stringify({ fileId: dbFile.id }),
            },
          })
          return { file: dbFile, reference }
        })
        return res.status(201).json({ ok: true, referenceId: created.reference.id, fileId: created.file.id })
      } catch (uploadErr: unknown) {
        logger.error({ err: uploadErr }, 'admin file upload failed')
        return res.status(500).json({ error: 'upload failed' })
      }
    })
  }

  return res.status(405).end()
}

export default withAdminAuth(handler)
