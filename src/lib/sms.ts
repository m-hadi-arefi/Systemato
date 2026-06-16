// eslint-disable-next-line @typescript-eslint/no-require-imports
const KavenegarApi = require('kavenegar').KavenegarApi

const api = KavenegarApi({ apikey: process.env.KAVENEGAR_API_KEY! })

/**
 * ارسال کد تأیید (OTP) با استفاده از VerifyLookup کاوه‌نگار.
 * این متد فقط با template از پیش‌تأییدشده کار می‌کند و برای کد یکبارمصرف است.
 */
export async function sendOtp(phone: string, code: string): Promise<void> {
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || 'systemato-otp'
  return new Promise((resolve, reject) => {
    api.VerifyLookup(
      { receptor: phone, token: code, template },
      (response: unknown, status: number) => {
        if (status === 200) resolve()
        else reject(new Error(`Kavenegar VerifyLookup error: ${status}`))
      }
    )
  })
}

/**
 * ارسال پیامک متنی آزاد (نوتیفیکیشن) با استفاده از Send کاوه‌نگار.
 * برای پیام‌های یادآوری/تأیید/لغو نوبت استفاده می‌شود.
 * در صورت نبود sender، شماره خط پیش‌فرض حساب کاوه‌نگار استفاده می‌شود.
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    api.Send(
      {
        receptor: phone,
        message,
        ...(process.env.KAVENEGAR_SENDER && { sender: process.env.KAVENEGAR_SENDER }),
      },
      (response: unknown, status: number) => {
        if (status === 200) resolve()
        else reject(new Error(`Kavenegar Send error: ${status}`))
      }
    )
  })
}
