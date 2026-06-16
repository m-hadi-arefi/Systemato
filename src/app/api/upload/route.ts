import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, validateFile } from '@/lib/minio'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'فایلی ارسال نشده' }, { status: 400 })

  try {
    validateFile(file.type, file.size)
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadFile(buffer, file.name, file.type)
    return NextResponse.json({ url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'خطا در آپلود'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
