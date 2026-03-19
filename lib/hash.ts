import crypto from 'crypto'

function normalizeForHash(input: string): string {
  return (input || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function computeContentHash(input: string): string {
  const normalized = normalizeForHash(input)
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex')
}
