// eslint-disable-next-line @typescript-eslint/no-require-imports
const KavenegarApi = require('kavenegar').KavenegarApi

const api = KavenegarApi({ apikey: process.env.KAVENEGAR_API_KEY! })

export async function sendOtp(phone: string, code: string): Promise<void> {
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || 'systemato-otp'
  return new Promise((resolve, reject) => {
    api.VerifyLookup(
      { receptor: phone, token: code, template },
      (response: unknown, status: number) => {
        if (status === 200) resolve()
        else reject(new Error(`Kavenegar error: ${status}`))
      }
    )
  })
}
