export type ChunkSegment = {
  content: string
  pageNumber: number
}

export function splitIntoChunks(text: string, pageNumber = 1, maxChars = 1200, overlapChars = 180): ChunkSegment[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean)

  const chunks: ChunkSegment[] = []
  let buffer = ''
  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    if (candidate.length <= maxChars) {
      buffer = candidate
      continue
    }
    if (buffer) chunks.push({ content: buffer, pageNumber })
    const tail = buffer.slice(Math.max(0, buffer.length - overlapChars))
    buffer = tail ? `${tail}\n\n${paragraph}` : paragraph
    if (buffer.length > maxChars) {
      chunks.push({ content: buffer.slice(0, maxChars), pageNumber })
      buffer = buffer.slice(maxChars - overlapChars)
    }
  }
  if (buffer) chunks.push({ content: buffer, pageNumber })
  return chunks
}

