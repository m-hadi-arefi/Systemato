import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { customerBookSchema } from '@/lib/validations/appointment'
import { sendSms } from '@/lib/sms'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const storeCode = searchParams.get('storeCode')

  const business = storeCode
    ? await prisma.business.findUnique({ where: { storeCode } })
    : null

  const appointments = await prisma.appointment.findMany({
    where: {
      customerId: session.user.id,
      ...(business && { businessId: business.id }),
    },
    include: { business: { select: { name: true, storeCode: true } } },
    orderBy: { datetime: 'desc' },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = customerBookSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // بررسی عضویت
  const member = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: session.user.id, businessId: business.id } },
  })
  if (!member) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      customerId: session.user.id,
      datetime: new Date(parsed.data.datetime),
      note: parsed.data.note,
      status: 'PENDING',
    },
  })

  // اطلاع به صاحب بیزینس
  const owner = await prisma.user.findUnique({ where: { id: business.ownerId } })
  if (owner) {
    // اگر SMS_ENABLED غیرفعال باشد، sendSms به‌صورت no-op برمی‌گردد.
    sendSms(owner.phone, `درخواست نوبت جدید در ${business.name}`).catch(console.error)
  }

  return NextResponse.json(appointment, { status: 201 })
}
