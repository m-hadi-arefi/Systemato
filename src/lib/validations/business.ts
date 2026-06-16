import { z } from 'zod'

// Working hours: per-day with multiple time ranges
export const timeRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت ساعت باید HH:MM باشد'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'فرمت ساعت باید HH:MM باشد'),
})

export const dayScheduleSchema = z.object({
  closed: z.boolean().default(false),
  ranges: z.array(timeRangeSchema).default([]),
})

export const workingHoursSchema = z.object({
  sat: dayScheduleSchema.optional(),
  sun: dayScheduleSchema.optional(),
  mon: dayScheduleSchema.optional(),
  tue: dayScheduleSchema.optional(),
  wed: dayScheduleSchema.optional(),
  thu: dayScheduleSchema.optional(),
  fri: dayScheduleSchema.optional(),
})

export const businessProfileSchema = z.object({
  name: z.string().min(2, 'نام بیزینس حداقل ۲ کاراکتر باشد').max(100),
  address: z.string().max(300).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید')
    .optional()
    .or(z.literal('')),
  description: z.string().max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر باشد').optional(),
  workingHours: workingHoursSchema.optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
})

export const addCustomerSchema = z.object({
  name: z.string().min(2, 'نام مشتری حداقل ۲ کاراکتر باشد').max(100),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
})

export const createServiceSchema = z.object({
  name: z.string().min(1, 'نام خدمت الزامی است').max(100),
  description: z.string().max(300).optional(),
  duration: z.number().int().min(5, 'حداقل ۵ دقیقه').max(480, 'حداکثر ۸ ساعت'),
  price: z.number().int().min(0).optional(),
  active: z.boolean().default(true),
})

export const updateServiceSchema = createServiceSchema.partial()

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>
export type AddCustomerInput = z.infer<typeof addCustomerSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type DaySchedule = z.infer<typeof dayScheduleSchema>
export type WorkingHours = z.infer<typeof workingHoursSchema>
