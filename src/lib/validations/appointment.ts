import { z } from 'zod'

export const createAppointmentSchema = z.object({
  customerId: z.string().min(1, 'مشتری انتخاب نشده'),
  datetime: z.string().refine((v) => !isNaN(Date.parse(v)), 'تاریخ و ساعت معتبر نیست'),
  note: z.string().max(300).optional(),
})

export const updateAppointmentSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DONE', 'CANCELLED']),
  note: z.string().max(300).optional(),
})

export const customerBookSchema = z.object({
  businessId: z.string().min(1),
  datetime: z.string().refine((v) => !isNaN(Date.parse(v)), 'تاریخ و ساعت معتبر نیست'),
  note: z.string().max(300).optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
export type CustomerBookInput = z.infer<typeof customerBookSchema>
