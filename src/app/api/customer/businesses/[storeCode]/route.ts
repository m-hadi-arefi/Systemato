import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { storeCode: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({
    where: { storeCode: params.storeCode },
    select: {
      id: true, name: true, address: true, latitude: true, longitude: true,
      phone: true, description: true, logoUrl: true, coverImageUrl: true,
      workingHours: true, storeCode: true, primaryColor: true, secondaryColor: true,
      services: { where: { active: true }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const member = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: session.user.id, businessId: business.id } },
  })
  if (!member) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  return NextResponse.json(business)
}
