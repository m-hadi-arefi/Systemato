import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPersianDateTime, formatPersianDate } from '@/lib/persian-date'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/signin')

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) redirect('/business/onboarding')
  if (!business.name) redirect('/business/onboarding')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1)

  const [customerCount, todayAppointments, pendingCount, upcomingAppointments, recentCustomers] =
    await Promise.all([
      prisma.businessMember.count({ where: { businessId: business.id } }),
      prisma.appointment.count({
        where: { businessId: business.id, datetime: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({ where: { businessId: business.id, status: 'PENDING' } }),
      prisma.appointment.findMany({
        where: {
          businessId: business.id,
          datetime: { gte: now },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          service: { select: { name: true } },
        },
        orderBy: { datetime: 'asc' },
        take: 5,
      }),
      prisma.businessMember.findMany({
        where: { businessId: business.id },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { joinedAt: 'desc' },
        take: 3,
      }),
    ])

  const isActive = business.freeUntil > now
  const daysLeft = Math.ceil((business.freeUntil.getTime() - Date.now()) / 86400000)

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    CONFIRMED: { label: 'تأیید شده', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{business.name}</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">
            {formatPersianDate(now)}
          </p>
        </div>
        {isActive ? (
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full font-medium flex-shrink-0">
            {daysLeft} روز رایگان
          </span>
        ) : (
          <Link
            href="/business/subscription"
            className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-full font-medium flex-shrink-0 hover:bg-red-200 transition-colors"
          >
            تمدید اشتراک
          </Link>
        )}
      </div>

      {/* Expired banner */}
      {!isActive && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">دوره رایگان شما به پایان رسیده</p>
            <Link href="/business/subscription" className="text-xs text-red-600 dark:text-red-400 underline mt-0.5 block">
              برای ادامه اشتراک تمدید کنید
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'مشتری', value: customerCount, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' },
          { label: 'نوبت امروز', value: todayAppointments, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'در انتظار', value: pendingCount, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">دسترسی سریع</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/business/appointments', label: 'ثبت نوبت جدید', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" /></svg>
            ), primary: true },
            { href: '/business/customers', label: 'افزودن مشتری', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            ) },
            { href: '/business/services', label: 'مدیریت خدمات', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            ) },
            { href: '/business/profile', label: 'لینک دعوت', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            ) },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                action.primary
                  ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                  : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]'
              }`}>
                {action.icon}
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">نوبت‌های پیش رو</h2>
            <Link href="/business/appointments" className="text-xs text-[var(--primary)] font-medium hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map((a) => {
              const st = statusMap[a.status] || { label: a.status, color: '' }
              return (
                <div key={a.id} className="flex items-center gap-3 p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] font-bold text-sm flex-shrink-0">
                    {(a.customer.name || a.customer.phone)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {a.customer.name || a.customer.phone}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatPersianDateTime(a.datetime)}
                      {a.service && ` · ${a.service.name}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${st.color}`}>
                    {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent customers */}
      {recentCustomers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">مشتریان اخیر</h2>
            <Link href="/business/customers" className="text-xs text-[var(--primary)] font-medium hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
            {recentCustomers.map(({ user }) => (
              <div key={user.phone} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] font-bold text-sm flex-shrink-0">
                  {(user.name || user.phone)[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.name || '—'}</p>
                  <p className="text-xs text-[var(--muted-foreground)]" dir="ltr">{user.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
