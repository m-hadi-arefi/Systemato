import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const member = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: params.id, businessId: business.id } },
    include: { user: true },
  })
  if (!member) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const appointments = await prisma.appointment.findMany({
    where: { customerId: params.id, businessId: business.id },
    orderBy: { datetime: 'desc' },
  })

  return NextResponse.json({ customer: member.user, appointments })
}
