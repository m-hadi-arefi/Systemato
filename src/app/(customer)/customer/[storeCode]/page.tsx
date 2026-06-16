import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { BusinessTheme } from '@/components/shared/BusinessTheme'
import Image from 'next/image'

type WorkingHours = Partial<Record<string, { closed?: boolean; ranges?: { open: string; close: string }[] }>>

function getFirstOpenRange(wh: WorkingHours): string | null {
  for (const day of Object.values(wh)) {
    if (day && !day.closed && day.ranges && day.ranges.length > 0) {
      return `${day.ranges[0].open} – ${day.ranges[0].close}`
    }
  }
  return null
}

export default async function BusinessViewPage({ params }: { params: { storeCode: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/signup?store_code=${params.storeCode}`)

  const business = await prisma.business.findUnique({
    where: { storeCode: params.storeCode },
    include: { services: { where: { active: true }, orderBy: { createdAt: 'asc' } } },
  })
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

  const wh = business.workingHours as WorkingHours | null
  const hoursDisplay = wh ? getFirstOpenRange(wh) : null

  return (
    <div className="space-y-4 animate-fade-in">
      <BusinessTheme
        primaryColor={business.primaryColor}
        secondaryColor={business.secondaryColor}
      />

      {/* Business Hero */}
      <div className="rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-sm">
        {business.coverImageUrl && (
          <div className="h-36 relative">
            <Image src={business.coverImageUrl} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-5 flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-[var(--muted)] overflow-hidden flex-shrink-0 border-2 border-white shadow-md ${business.coverImageUrl ? '-mt-10' : ''}`}>
            {business.logoUrl
              ? <Image src={business.logoUrl} alt={business.name} width={64} height={64} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center text-2xl bg-[var(--primary)]/10">🏪</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{business.name}</h1>
            {business.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">{business.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming notice */}
      {upcomingCount > 0 && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <p className="text-sm font-medium text-[var(--primary)]">
              {upcomingCount} نوبت فعال دارید
            </p>
          </div>
          <Link href={`/customer/${params.storeCode}/appointments`} className="text-sm text-[var(--primary)] font-medium hover:underline">
            مشاهده →
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/customer/${params.storeCode}/book`}>
          <div className="flex flex-col items-center gap-2 p-4 bg-[var(--primary)] text-white rounded-2xl cursor-pointer hover:opacity-90 transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">رزرو نوبت</span>
          </div>
        </Link>
        <Link href={`/customer/${params.storeCode}/appointments`}>
          <div className="flex flex-col items-center gap-2 p-4 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl cursor-pointer hover:border-[var(--primary)] transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">نوبت‌های من</span>
          </div>
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {business.phone && (
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)]">تماس</span>
            </div>
            <div className="text-sm font-medium" dir="ltr">{business.phone}</div>
          </Card>
        )}
        {hoursDisplay && (
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)]">ساعات کاری</span>
            </div>
            <div className="text-sm font-medium" dir="ltr">{hoursDisplay}</div>
          </Card>
        )}
        {business.address && (
          <Card className="col-span-2">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-[var(--foreground)]">{business.address}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Services */}
      {business.services.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">خدمات</h2>
          <div className="space-y-2">
            {business.services.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{s.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.duration} دقیقه</p>
                </div>
                {s.price ? (
                  <span className="text-sm font-semibold text-[var(--primary)]">
                    {new Intl.NumberFormat('fa-IR').format(s.price)} ت
                  </span>
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">رایگان</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
