// eslint-disable-next-line @typescript-eslint/no-require-imports
const KavenegarApi = require('kavenegar').KavenegarApi

/**
 * فعال‌بودن ارسال واقعی پیامک.
 * تا وقتی پنل/خط کاوه‌نگار آماده نشده، SMS_ENABLED را روی false بگذارید:
 *   - کد OTP به‌جای ارسال، در پاسخ API برگردانده می‌شود (debug_code)
 *   - پیامک‌های نوتیفیکیشن (نوبت/یادآوری) ارسال نمی‌شوند
 * هر وقت پنل آماده شد، فقط SMS_ENABLED=true را ست کنید؛ بقیهٔ کد آماده است.
 */
export function isSmsEnabled(): boolean {
  return process.env.SMS_ENABLED === 'true'
}

function getApi() {
  return KavenegarApi({ apikey: process.env.KAVENEGAR_API_KEY! })
}

/**
 * ارسال کد تأیید (OTP) با استفاده از VerifyLookup کاوه‌نگار.
 * این متد فقط با template از پیش‌تأییدشده کار می‌کند و برای کد یکبارمصرف است.
 * اگر SMS_ENABLED غیرفعال باشد، چیزی ارسال نمی‌شود (no-op).
 */
export async function sendOtp(phone: string, code: string): Promise<void> {
  if (!isSmsEnabled()) return
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || 'systemato-otp'
  return new Promise((resolve, reject) => {
    getApi().VerifyLookup(
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
 * اگر SMS_ENABLED غیرفعال باشد، چیزی ارسال نمی‌شود (no-op).
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  if (!isSmsEnabled()) return
  return new Promise((resolve, reject) => {
    getApi().Send(
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
