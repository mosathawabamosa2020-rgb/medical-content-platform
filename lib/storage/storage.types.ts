export type StorageBucket = 'references' | 'processed' | 'images'

export type UploadFileInput = {
  bucket: string
  key: string
  body: Buffer
  contentType: string
}

