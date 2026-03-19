import fs from 'fs'
import path from 'path'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

type StoredObject = {
  storage: 'minio' | 'local'
  bucket?: string
  key: string
  filePath: string
}

const hasMinio =
  Boolean(process.env.MINIO_ENDPOINT) &&
  Boolean(process.env.MINIO_USER) &&
  Boolean(process.env.MINIO_PASSWORD)

const s3Client = hasMinio
  ? new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_USER as string,
        secretAccessKey: process.env.MINIO_PASSWORD as string,
      },
      forcePathStyle: true,
    })
  : null

export function resolveMinioBucket(kind: 'references' | 'processed' | 'images'): string {
  if (kind === 'references') return process.env.MINIO_BUCKET_REFERENCES || 'references'
  if (kind === 'processed') return process.env.MINIO_BUCKET_PROCESSED || 'processed'
  return process.env.MINIO_BUCKET_IMAGES || 'images'
}

export async function storeBuffer(params: {
  bucket: string
  key: string
  buffer: Buffer
  contentType: string
}): Promise<StoredObject> {
  const { bucket, key, buffer, contentType } = params

  if (s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )
    return { storage: 'minio', bucket, key, filePath: `minio://${bucket}/${key}` }
  }

  const uploadsDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const filePath = path.join(uploadsDir, key)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, buffer)
  return { storage: 'local', key, filePath }
}

export async function uploadFile(params: {
  bucket: string
  key: string
  body: Buffer
  contentType: string
}): Promise<StoredObject> {
  return storeBuffer({
    bucket: params.bucket,
    key: params.key,
    buffer: params.body,
    contentType: params.contentType,
  })
}

export async function downloadFile(params: { bucket: string; key: string }): Promise<Buffer | null> {
  if (s3Client) {
    const result = await s3Client.send(new GetObjectCommand({ Bucket: params.bucket, Key: params.key }))
    const stream = result.Body as any
    if (!stream) return null
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  const filePath = path.join(process.cwd(), 'uploads', params.key)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath)
}

export async function deleteFile(params: { bucket: string; key: string }): Promise<void> {
  if (s3Client) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: params.bucket, Key: params.key }))
    return
  }

  const filePath = path.join(process.cwd(), 'uploads', params.key)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

export function isMinioEnabled(): boolean {
  return Boolean(s3Client)
}

export async function getObjectStream(params: { bucket: string; key: string }) {
  if (!s3Client) return null
  const result = await s3Client.send(new GetObjectCommand({ Bucket: params.bucket, Key: params.key }))
  return result.Body || null
}
