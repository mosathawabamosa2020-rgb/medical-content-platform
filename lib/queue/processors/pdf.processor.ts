import pdf from 'pdf-parse'
import prisma from '../../db/prisma'
import { classifyChunk } from '../../utils/chunk-classifier'
import { splitIntoChunks } from '../../utils/chunk-splitter'
import { downloadFile } from '../../storage/storage.adapter'

export async function processPdfJob(referenceId: string, bucket: string, key: string) {
  const file = await downloadFile({ bucket, key })
  if (!file) throw new Error('pdf_not_found')
  const parsed = await pdf(file)
  const chunks = splitIntoChunks(parsed.text || '', 1)
  for (const chunk of chunks) {
    await prisma.knowledgeChunk.create({
      data: {
        referenceId,
        content: chunk.content,
        category: classifyChunk(chunk.content),
        pageNumber: chunk.pageNumber,
      },
    })
  }
}


