import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateAppointmentSchema } from '@/lib/validations/appointment'
import { sendSms } from '@/lib/sms'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId: business.id },
    include: { customer: true },
  })
  if (!appointment) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateAppointmentSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: parsed.data.status, ...(parsed.data.note && { note: parsed.data.note }) },
  })

  // ارسال SMS به مشتری
  const dt = appointment.datetime.toLocaleString('fa-IR')
  const messages: Record<string, string> = {
    CONFIRMED: `نوبت شما در ${business.name} تأیید شد: ${dt}`,
    CANCELLED: `نوبت شما در ${business.name} لغو شد`,
    DONE: `از مراجعه شما به ${business.name} متشکریم`,
  }
  const msg = messages[parsed.data.status]
  if (msg) {
    // اگر SMS_ENABLED غیرفعال باشد، sendSms به‌صورت no-op برمی‌گردد.
    sendSms(appointment.customer.phone, msg).catch(console.error)
  }

  return NextResponse.json(updated)
}
