import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const memberships = await prisma.businessMember.findMany({
    where: { userId: session.user.id },
    include: {
      business: {
        select: { id: true, name: true, description: true, logoUrl: true, storeCode: true },
      },
    },
  })

  return NextResponse.json(memberships.map((m) => m.business))
}
