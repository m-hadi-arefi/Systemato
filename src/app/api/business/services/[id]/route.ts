import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateServiceSchema } from '@/lib/validations/business'

async function getOwnedService(serviceId: string, ownerId: string) {
  const business = await prisma.business.findUnique({ where: { ownerId } })
  if (!business) return null
  return prisma.service.findFirst({ where: { id: serviceId, businessId: business.id } })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const service = await getOwnedService(params.id, session.user.id)
  if (!service) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = updateServiceSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const updated = await prisma.service.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const service = await getOwnedService(params.id, session.user.id)
  if (!service) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await prisma.service.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
