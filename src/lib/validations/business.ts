import { z } from 'zod'

export const workingHoursSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت ساعت باید HH:MM باشد'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت ساعت باید HH:MM باشد'),
})

export const businessProfileSchema = z.object({
  name: z.string().min(2, 'نام بیزینس حداقل ۲ کاراکتر باشد').max(100),
  address: z.string().max(300).optional(),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر باشد').optional(),
  workingHours: workingHoursSchema.optional(),
})

export const addCustomerSchema = z.object({
  name: z.string().min(2, 'نام مشتری حداقل ۲ کاراکتر باشد').max(100),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
})

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type AddCustomerInput = z.infer<typeof addCustomerSchema>
