import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionPrice, getReferralBonus } from '@/lib/config'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({
    where: { ownerId: session.user.id },
    include: {
      payments: {
        where: { verified: true },
        orderBy: { verifiedAt: 'desc' },
      },
    },
  })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((business.freeUntil.getTime() - now.getTime()) / 86400000))
  const isActive = business.freeUntil > now

  const referralCount = await prisma.business.count({ where: { referredBy: business.referralCode } })
  const referralBonusDays = await getReferralBonus()
  const subscriptionPrice = await getSubscriptionPrice()

  let referredByName: string | null = null
  if (business.referredBy) {
    const referrer = await prisma.business.findUnique({
      where: { referralCode: business.referredBy },
      select: { name: true },
    })
    referredByName = referrer?.name ?? null
  }

  return NextResponse.json({
    freeUntil: business.freeUntil,
    daysLeft,
    isActive,
    subscriptionPrice,
    referralCount,
    referralBonusDays,
    referredByName,
    payments: business.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      months: p.months,
      refId: p.refId,
      createdAt: p.createdAt,
      verifiedAt: p.verifiedAt,
    })),
  })
}
