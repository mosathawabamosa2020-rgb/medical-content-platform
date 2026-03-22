import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/db/prisma'
import dns from 'node:dns/promises'
import net from 'node:net'
import { getServerSession } from 'next-auth/next'
import { enforceCsrfForMutation, enforceRateLimit, setSecurityHeaders } from '../../../../lib/apiSecurity'
import logger from '../../../../lib/logger'
import { computeContentHash } from '../../../../lib/hash'
import { deriveSourceIdentifiers } from '../../../../lib/sourceIdentifiers'
import authOptions from '../../../../lib/auth'
import { resolveMinioBucket, storeBuffer } from '../../../../lib/storage/storageAdapter'

const BLOCKED_PROTOCOLS = new Set(['file:', 'ftp:', 'gopher:'])
const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  'metadata.google.internal',
  '100.100.100.200',
  '::1',
])

function isPrivateOrLocalIp(value: string): boolean {
  if (net.isIPv4(value)) {
    if (value.startsWith('10.') || value.startsWith('127.') || value.startsWith('169.254.')) return true
    if (value.startsWith('192.168.')) return true
    const second = Number(value.split('.')[1] || 0)
    if (value.startsWith('172.') && second >= 16 && second <= 31) return true
    if (value === '0.0.0.0') return true
  }
  if (net.isIPv6(value)) {
    const normalized = value.toLowerCase()
    if (normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:')) return true
  }
  return false
}

async function assertExternalHttpUrl(rawUrl: string) {
  const parsedUrl = new URL(rawUrl)
  const hostname = parsedUrl.hostname.toLowerCase()
  if (!['http:', 'https:'].includes(parsedUrl.protocol) || BLOCKED_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error('blocked_protocol')
  }
  if (BLOCKED_HOSTS.has(hostname)) throw new Error('blocked_host')
  if (net.isIP(hostname) && isPrivateOrLocalIp(hostname)) throw new Error('blocked_ip')

  const resolved = await dns.lookup(hostname, { all: true })
  for (const entry of resolved) {
    if (isPrivateOrLocalIp(entry.address)) throw new Error('blocked_ip')
  }
}

function scoreSource(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('fda.gov')) return 0.98
    if (host.includes('pubmed.ncbi.nlm.nih.gov')) return 0.95
    if (host.includes('siemens-healthineers.com') || host.includes('gehealthcare.com') || host.includes('philips.com') || host.includes('mindray.com')) return 0.9
    if (host.includes('wikipedia.org') || host.includes('wikimedia.org')) return 0.7
  } catch {
    return 0.5
  }
  return 0.6
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setSecurityHeaders(res)
  if (!enforceRateLimit(req, res, 'discovery-ingest', 60_000, 30)) return
  if (!enforceCsrfForMutation(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  const session = (await getServerSession(req, res, authOptions as any)) as any
  if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' })
  if (!['admin', 'editor'].includes(String(session?.user?.role || ''))) {
    return res.status(403).json({ error: 'forbidden' })
  }
  if (!enforceRateLimit(req, res, `discovery-ingest-user-${session.user.id}`, 60 * 60 * 1000, 20)) return

  const { url, deviceId, title } = req.body as { url?: string; deviceId?: string; title?: string }
  if (!url || !deviceId) return res.status(400).json({ error: 'url and deviceId required' })

  try {
    await assertExternalHttpUrl(url)
    const resp = await fetch(url, { redirect: 'manual' })
    if (resp.status >= 300 && resp.status < 400) {
      return res.status(400).json({ error: 'redirects are blocked by crawl policy' })
    }
    if (!resp.ok) return res.status(400).json({ error: 'Failed to fetch URL' })

    const contentType = resp.headers.get('content-type') || ''
    if (contentType.includes('pdf')) {
      const buffer = Buffer.from(await resp.arrayBuffer())
      const contentHash = computeContentHash(buffer.toString('base64'))
      const filename = `ref_${Date.now()}.pdf`
      const identifiers = deriveSourceIdentifiers({ sourceUrl: url, title: title || filename })
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
          await prisma.ingestionLog.create({ data: { message: 'discovery duplicate by identifiers', referenceId: duplicateByIdentifiers.id } })
          return res.status(409).json({ error: 'duplicate source identifiers', referenceId: duplicateByIdentifiers.id })
        }
      }
      const duplicate = await prisma.reference.findFirst({ where: { contentHash, deviceId }, select: { id: true } })
      if (duplicate) {
        await prisma.ingestionLog.create({ data: { message: 'discovery duplicate by content', referenceId: duplicate.id } })
        return res.status(409).json({ error: 'duplicate content', referenceId: duplicate.id })
      }

      const created = await prisma.reference.create({
        data: {
          deviceId,
          title: title || filename,
          filePath: null,
          contentHash,
          doi: identifiers.doi,
          pmid: identifiers.pmid,
          arxivId: identifiers.arxivId,
          sourceFingerprint: identifiers.sourceFingerprint,
          sourceUrl: url,
          sourceReliabilityScore: scoreSource(url),
        },
      })
      try {
        const stored = await storeBuffer({
          bucket: resolveMinioBucket('references'),
          key: `${created.id}.pdf`,
          buffer,
          contentType: 'application/pdf',
        })
        await prisma.reference.update({ where: { id: created.id }, data: { filePath: stored.filePath } })
      } catch (e: unknown) {
        await prisma.reference.delete({ where: { id: created.id } }).catch(() => null)
        throw e
      }
      const updated = await prisma.reference.findUnique({ where: { id: created.id } })
      return res.status(201).json({ created: updated || created })
    }

    // For non-PDF: save normalized HTML snapshot after duplicate checks.
    const text = await resp.text()
    const contentHash = computeContentHash(text)
    const filename = `ref_${Date.now()}.html`
    const identifiers = deriveSourceIdentifiers({ sourceUrl: url, title: title || filename })
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
        await prisma.ingestionLog.create({ data: { message: 'discovery duplicate by identifiers', referenceId: duplicateByIdentifiers.id } })
        return res.status(409).json({ error: 'duplicate source identifiers', referenceId: duplicateByIdentifiers.id })
      }
    }
    const duplicate = await prisma.reference.findFirst({ where: { contentHash, deviceId }, select: { id: true } })
    if (duplicate) {
      await prisma.ingestionLog.create({ data: { message: 'discovery duplicate by content', referenceId: duplicate.id } })
      return res.status(409).json({ error: 'duplicate content', referenceId: duplicate.id })
    }
    const created = await prisma.reference.create({
      data: {
        deviceId,
        title: title || filename,
        filePath: null,
        parsedText: text.substring(0, 2000),
        contentHash,
        doi: identifiers.doi,
        pmid: identifiers.pmid,
        arxivId: identifiers.arxivId,
        sourceFingerprint: identifiers.sourceFingerprint,
        sourceUrl: url,
        sourceReliabilityScore: scoreSource(url),
      },
    })
    try {
      const stored = await storeBuffer({
        bucket: resolveMinioBucket('processed'),
        key: `${created.id}.html`,
        buffer: Buffer.from(text, 'utf8'),
        contentType: 'text/html; charset=utf-8',
      })
      await prisma.reference.update({ where: { id: created.id }, data: { filePath: stored.filePath } })
    } catch (e: unknown) {
      await prisma.reference.delete({ where: { id: created.id } }).catch(() => null)
      throw e
    }
    const updated = await prisma.reference.findUnique({ where: { id: created.id } })
    return res.status(201).json({ created: updated || created })
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : 'unknown_error'
    if (String((err as any)?.code || '') === 'P2002') {
      return res.status(409).json({ error: 'duplicate reference' })
    }
    if (['blocked_protocol', 'blocked_host', 'blocked_ip'].includes(reason)) {
      return res.status(400).json({ error: 'url blocked by crawl policy', reason })
    }
    logger.error({ err, url, deviceId, reason }, 'discovery ingest failed')
    return res.status(500).json({ error: 'Ingest failed', reason })
  }
}
