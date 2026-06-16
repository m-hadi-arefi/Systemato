import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtp } from '@/lib/sms'
import { generateCode } from '@/lib/utils'
import { sendOtpSchema } from '@/lib/validations/auth'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = sendOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { phone } = parsed.data
    const code = generateCode(4)

    await prisma.otpCode.create({
      data: { phone, code, expiresAt: addMinutes(new Date(), 5) },
    })

    if (process.env.NODE_ENV === 'production') {
      await sendOtp(phone, code)
    }

    return NextResponse.json({
      success: true,
      ...(process.env.NODE_ENV === 'development' && { debug_code: code }),
    })
  } catch {
    return NextResponse.json({ error: 'خطا در ارسال کد تأیید' }, { status: 500 })
  }
}
