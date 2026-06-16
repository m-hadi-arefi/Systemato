import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import Image from 'next/image'

export default async function BusinessViewPage({ params }: { params: { storeCode: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/signup?store_code=${params.storeCode}`)

  const business = await prisma.business.findUnique({ where: { storeCode: params.storeCode } })
  if (!business) notFound()

  const member = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId: session.user.id, businessId: business.id } },
  })
  if (!member) redirect(`/signup?store_code=${params.storeCode}`)

  const upcomingCount = await prisma.appointment.count({
    where: {
      customerId: session.user.id,
      businessId: business.id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      datetime: { gte: new Date() },
    },
  })

  const wh = business.workingHours as { open?: string; close?: string } | null

  return (
    <div className="space-y-4">
      {/* Business Header */}
      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[var(--muted)] overflow-hidden flex-shrink-0">
          {business.logoUrl
            ? <Image src={business.logoUrl} alt={business.name} width={64} height={64} className="object-cover w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[var(--foreground)] truncate">{business.name}</h1>
          {business.address && (
            <p className="text-sm text-[var(--muted-foreground)] truncate">📍 {business.address}</p>
          )}
        </div>
      </Card>

      {business.description && (
        <Card>
          <p className="text-sm text-[var(--foreground)]">{business.description}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {business.phone && (
          <Card className="text-center">
            <div className="text-xl mb-1">📞</div>
            <div className="text-xs text-[var(--muted-foreground)]">تماس</div>
            <div className="text-sm font-medium mt-0.5" dir="ltr">{business.phone}</div>
          </Card>
        )}
        {wh?.open && (
          <Card className="text-center">
            <div className="text-xl mb-1">⏰</div>
            <div className="text-xs text-[var(--muted-foreground)]">ساعات کاری</div>
            <div className="text-sm font-medium mt-0.5" dir="ltr">{wh.open} – {wh.close}</div>
          </Card>
        )}
      </div>

      {upcomingCount > 0 && (
        <div className="bg-[#0FB9B1]/10 border border-[#0FB9B1]/30 rounded-xl p-4">
          <p className="text-sm text-[#0FB9B1] font-medium">
            {upcomingCount} نوبت فعال دارید
          </p>
          <Link href={`/customer/${params.storeCode}/appointments`} className="text-sm text-[#0FB9B1] underline mt-1 block">
            مشاهده نوبت‌ها
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/customer/${params.storeCode}/book`}>
          <Button size="lg" className="w-full">📅 رزرو نوبت</Button>
        </Link>
        <Link href={`/customer/${params.storeCode}/appointments`}>
          <Button size="lg" variant="outline" className="w-full">نوبت‌های من</Button>
        </Link>
      </div>
    </div>
  )
}
