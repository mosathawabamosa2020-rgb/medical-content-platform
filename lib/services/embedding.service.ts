import { generateEmbedding } from '../embeddings/embeddings'

export async function embedContent(text: string) {
  return generateEmbedding(text)
}

