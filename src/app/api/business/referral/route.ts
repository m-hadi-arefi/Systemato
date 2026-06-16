import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionPrice } from '@/lib/config'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const referralCount = await prisma.business.count({ where: { referredBy: business.referralCode } })
  const subscriptionPrice = await getSubscriptionPrice()
  const isActive = business.freeUntil > new Date()

  return NextResponse.json({
    referralCode: business.referralCode,
    storeCode: business.storeCode,
    referralCount,
    freeUntil: business.freeUntil,
    isActive,
    subscriptionPrice,
  })
}
