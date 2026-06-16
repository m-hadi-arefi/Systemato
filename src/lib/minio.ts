import * as Minio from 'minio'
import { randomUUID } from 'crypto'
import path from 'path'

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

const BUCKET = process.env.MINIO_BUCKET || 'systemato-media'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

export function validateFile(mimetype: string, size: number) {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new Error('فقط تصاویر JPG، PNG و WebP مجاز است')
  }
  if (size > MAX_SIZE) {
    throw new Error('حجم فایل نباید بیشتر از ۲ مگابایت باشد')
  }
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> {
  const ext = path.extname(originalName) || '.jpg'
  const filename = `${randomUUID()}${ext}`
  await minioClient.putObject(BUCKET, filename, buffer, buffer.length, {
    'Content-Type': mimetype,
  })
  return `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET}/${filename}`
}
