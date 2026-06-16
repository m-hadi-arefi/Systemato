import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtp, isSmsEnabled } from '@/lib/sms'
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

    const smsEnabled = isSmsEnabled()

    // وقتی SMS فعال است، کد با کاوه‌نگار ارسال می‌شود.
    if (smsEnabled) {
      await sendOtp(phone, code)
    }

    // تا وقتی SMS غیرفعال است، کد را در پاسخ برمی‌گردانیم تا قابل تست باشد.
    // به محض فعال‌شدن SMS_ENABLED، دیگر کد در پاسخ نمی‌آید.
    return NextResponse.json({
      success: true,
      ...(!smsEnabled && { debug_code: code }),
    })
  } catch {
    return NextResponse.json({ error: 'خطا در ارسال کد تأیید' }, { status: 500 })
  }
}
