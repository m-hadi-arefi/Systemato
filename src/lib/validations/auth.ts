import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد')

export const sendOtpSchema = z.object({
  phone: phoneSchema,
  referralCode: z.string().optional(),
  storeCode: z.string().optional(),
  role: z.enum(['BUSINESS_OWNER', 'CUSTOMER']).optional(),
})

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(4, 'کد تأیید ۴ رقمی است'),
  referralCode: z.string().optional(),
  storeCode: z.string().optional(),
  role: z.enum(['BUSINESS_OWNER', 'CUSTOMER']).optional(),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
