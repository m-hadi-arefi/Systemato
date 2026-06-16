import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createServiceSchema } from '@/lib/validations/business'

async function getBusiness(ownerId: string) {
  return prisma.business.findUnique({ where: { ownerId } })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const services = await prisma.service.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = createServiceSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const service = await prisma.service.create({
    data: { ...parsed.data, businessId: business.id },
  })

  return NextResponse.json(service, { status: 201 })
}
