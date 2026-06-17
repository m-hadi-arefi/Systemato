const ZARINPAL_REQUEST_URL = 'https://payment.zarinpal.com/pg/v4/payment/request.json'
const ZARINPAL_VERIFY_URL = 'https://payment.zarinpal.com/pg/v4/payment/verify.json'
export const ZARINPAL_START_PAY_URL = 'https://payment.zarinpal.com/pg/StartPay/'

export async function requestPayment({
  amount,
  description,
  callbackUrl,
}: {
  amount: number  // Toman
  description: string
  callbackUrl: string
}): Promise<string> {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID
  if (!merchantId) throw new Error('ZARINPAL_MERCHANT_ID تنظیم نشده')

  const res = await fetch(ZARINPAL_REQUEST_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount,
      currency: 'IRT',
      description,
      callback_url: callbackUrl,
    }),
  })

  const json = await res.json()
  if (json.data?.code !== 100) {
    throw new Error(json.errors?.message ?? 'خطا در اتصال به درگاه پرداخت')
  }
  return json.data.authority as string
}

export async function verifyPayment({
  authority,
  amount,
}: {
  authority: string
  amount: number  // Toman
}): Promise<{ verified: boolean; refId: number | null; alreadyVerified: boolean }> {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID
  if (!merchantId) throw new Error('ZARINPAL_MERCHANT_ID تنظیم نشده')

  const res = await fetch(ZARINPAL_VERIFY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount,
      currency: 'IRT',
      authority,
    }),
  })

  const json = await res.json()
  const code = json.data?.code
  if (code === 100) return { verified: true, refId: json.data.ref_id, alreadyVerified: false }
  if (code === 101) return { verified: true, refId: json.data.ref_id, alreadyVerified: true }
  return { verified: false, refId: null, alreadyVerified: false }
}
