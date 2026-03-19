const OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings'

function zeroVector(dim: number): number[] {
  return Array.from({ length: dim }, () => 0)
}

async function embedWithOpenAI(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('openai_key_missing')
  const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
  const dimensions = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 1536)
  const response = await fetch(OPENAI_EMBEDDING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: text, dimensions }),
  })
  if (!response.ok) throw new Error(`openai_embed_failed:${response.status}`)
  const json = await response.json()
  const vector = json?.data?.[0]?.embedding
  if (!Array.isArray(vector)) throw new Error('openai_embed_invalid')
  return vector.map((x: unknown) => Number(x))
}

async function embedWithService(text: string): Promise<number[]> {
  const endpoint = process.env.EMBEDDING_SERVICE_URL
  if (!endpoint) throw new Error('embedding_service_missing')
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model: process.env.EMBEDDING_MODEL || 'BAAI/bge-m3' }),
  })
  if (!response.ok) throw new Error(`embedding_service_failed:${response.status}`)
  const json = await response.json()
  const vector = json?.embedding
  if (!Array.isArray(vector)) throw new Error('embedding_service_invalid')
  return vector.map((x: unknown) => Number(x))
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const phase2 = Boolean(process.env.EMBEDDING_SERVICE_URL)
  try {
    if (phase2) return await embedWithService(text)
    return await embedWithOpenAI(text)
  } catch (err) {
    const dim = phase2 ? Number(process.env.EMBEDDING_DIMENSIONS || 1024) : Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 1536)
    console.warn('embedding fallback to zero vector', err)
    return zeroVector(dim)
  }
}

