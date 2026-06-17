import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPayment } from '@/lib/zarinpal'
import { addDays } from 'date-fns'
import { eventBus } from '@/lib/realtime/eventBus'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const authority = searchParams.get('Authority')
  const status = searchParams.get('Status')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const basePath = `${appUrl}/business/subscription`

  if (!authority || status !== 'OK') {
    return NextResponse.redirect(`${basePath}?error=cancelled`)
  }

  const payment = await prisma.payment.findUnique({
    where: { authority },
    include: { business: true },
  })

  if (!payment || payment.verified) {
    return NextResponse.redirect(`${basePath}?error=invalid`)
  }

  const result = await verifyPayment({ authority, amount: payment.amount })

  if (!result.verified) {
    return NextResponse.redirect(`${basePath}?error=failed`)
  }

  const now = new Date()
  const currentExpiry = payment.business.freeUntil > now ? payment.business.freeUntil : now
  const newFreeUntil = addDays(currentExpiry, payment.months * 30)

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        verified: true,
        refId: String(result.refId),
        verifiedAt: now,
      },
    }),
    prisma.business.update({
      where: { id: payment.businessId },
      data: { freeUntil: newFreeUntil },
    }),
  ])

  eventBus.emit({
    type: 'payment.verified',
    payload: {
      paymentId: payment.id,
      businessId: payment.businessId,
      ownerId: payment.business.ownerId,
      amount: payment.amount,
      newFreeUntil: newFreeUntil.toISOString(),
    },
  })

  eventBus.emit({
    type: 'business.updated',
    payload: {
      businessId: payment.businessId,
      storeCode: payment.business.storeCode,
      ownerId: payment.business.ownerId,
      changedFields: ['subscription'],
      newFreeUntil: newFreeUntil.toISOString(),
    },
  })

  return NextResponse.redirect(`${basePath}?success=1&ref=${result.refId}`)
}
