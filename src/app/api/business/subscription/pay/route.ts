import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionPrice } from '@/lib/config'
import { requestPayment, ZARINPAL_START_PAY_URL } from '@/lib/zarinpal'
import { z } from 'zod'

const schema = z.object({ months: z.number().int().min(1).max(12) })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'تعداد ماه نامعتبر است' }, { status: 400 })

  const { months } = parsed.data
  const pricePerMonth = await getSubscriptionPrice()
  const totalAmount = pricePerMonth * months

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const callbackUrl = `${appUrl}/api/business/subscription/verify`

  const authority = await requestPayment({
    amount: totalAmount,
    description: `خرید ${months} ماه اشتراک سیستماتو - ${business.name}`,
    callbackUrl,
  })

  await prisma.payment.create({
    data: {
      businessId: business.id,
      authority,
      amount: totalAmount,
      months,
    },
  })

  return NextResponse.json({ url: `${ZARINPAL_START_PAY_URL}${authority}` })
}
