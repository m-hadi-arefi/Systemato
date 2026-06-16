import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card } from '@/components/shared/Card'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/signin')

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) redirect('/business/onboarding')
  if (!business.name) redirect('/business/onboarding')

  const [customerCount, todayAppointments, pendingCount] = await Promise.all([
    prisma.businessMember.count({ where: { businessId: business.id } }),
    prisma.appointment.count({
      where: {
        businessId: business.id,
        datetime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.appointment.count({ where: { businessId: business.id, status: 'PENDING' } }),
  ])

  const isActive = business.freeUntil > new Date()
  const daysLeft = Math.ceil((business.freeUntil.getTime() - Date.now()) / 86400000)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{business.name}</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          {isActive ? `${daysLeft} روز رایگان باقی‌مانده` : 'اشتراک منقضی شده'}
        </p>
      </div>

      {!isActive && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
            دوره رایگان شما به پایان رسیده. برای ادامه اشتراک تمدید کنید.
          </p>
          <Link href="/business/subscription" className="text-red-600 underline text-sm mt-1 block">
            تمدید اشتراک
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="text-3xl font-bold text-[#0FB9B1]">{customerCount}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">مشتری</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-[#F79621]">{todayAppointments}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">نوبت امروز</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-500">{pendingCount}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">در انتظار</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/business/customers">
          <Card className="flex flex-col items-center gap-2 cursor-pointer hover:border-[#0FB9B1] transition-colors">
            <span className="text-3xl">👥</span>
            <span className="text-sm font-medium">افزودن مشتری</span>
          </Card>
        </Link>
        <Link href="/business/appointments">
          <Card className="flex flex-col items-center gap-2 cursor-pointer hover:border-[#0FB9B1] transition-colors">
            <span className="text-3xl">📅</span>
            <span className="text-sm font-medium">ثبت نوبت</span>
          </Card>
        </Link>
        <Link href="/business/profile">
          <Card className="flex flex-col items-center gap-2 cursor-pointer hover:border-[#0FB9B1] transition-colors">
            <span className="text-3xl">🔗</span>
            <span className="text-sm font-medium">کد دعوت</span>
          </Card>
        </Link>
        <Link href="/business/referral">
          <Card className="flex flex-col items-center gap-2 cursor-pointer hover:border-[#0FB9B1] transition-colors">
            <span className="text-3xl">🎁</span>
            <span className="text-sm font-medium">رفرال</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
