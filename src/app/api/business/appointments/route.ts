import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAppointmentSchema } from '@/lib/validations/appointment'

async function getBusiness(ownerId: string) {
  return prisma.business.findUnique({ where: { ownerId } })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const appointments = await prisma.appointment.findMany({
    where: {
      businessId: business.id,
      ...(status && { status: status as never }),
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      service: { select: { id: true, name: true, duration: true } },
    },
    orderBy: { datetime: 'asc' },
  })

  // Resolve customer display names from BusinessMember.displayName
  const memberMap = new Map<string, string | null>()
  const memberRecords = await prisma.businessMember.findMany({
    where: { businessId: business.id },
    select: { userId: true, displayName: true },
  })
  memberRecords.forEach((m) => memberMap.set(m.userId, m.displayName))

  const enriched = appointments.map((a) => ({
    ...a,
    customer: {
      ...a.customer,
      name: memberMap.get(a.customerId) || a.customer.name,
    },
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = createAppointmentSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const member = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: parsed.data.customerId, businessId: business.id } },
  })
  if (!member)
    return NextResponse.json({ error: 'این مشتری عضو بیزینس شما نیست' }, { status: 400 })

  const appointment = await prisma.appointment.create({
    data: {
      businessId: business.id,
      customerId: parsed.data.customerId,
      serviceId: parsed.data.serviceId || null,
      datetime: new Date(parsed.data.datetime),
      note: parsed.data.note,
      status: 'CONFIRMED',
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      service: { select: { id: true, name: true, duration: true } },
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
