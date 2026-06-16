'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPersianDateTime, formatPersianDate } from '@/lib/persian-date'

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'در انتظار تأیید', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
  CONFIRMED: { label: 'تأیید شده', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-400' },
  DONE: { label: 'انجام شده', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-400' },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-400' },
}

interface Appointment {
  id: string
  datetime: string
  status: string
  note: string | null
  business: { name: string; storeCode: string }
  service: { name: string; duration: number } | null
}

export default function CustomerAppointmentsPage({ params }: { params: { storeCode: string } }) {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/customer/appointments?storeCode=${params.storeCode}`)
      .then(r => r.json())
      .then(data => { setAppointments(data); setLoading(false) })
  }, [params.storeCode])

  const now = new Date()
  const upcoming = appointments.filter(
    a => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.datetime) >= now
  )
  const past = appointments.filter(a => !upcoming.includes(a))

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-[var(--muted)] rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  function AppointmentCard({ a, dim }: { a: Appointment; dim?: boolean }) {
    const st = statusConfig[a.status] || { label: a.status, color: '', dot: '' }
    return (
      <Card className={dim ? 'opacity-60' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--foreground)]">
              {formatPersianDateTime(a.datetime)}
            </p>
            {a.service && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.service.name} · {a.service.duration} دقیقه</p>
            )}
            {a.note && <p className="text-xs text-[var(--muted-foreground)] mt-1">{a.note}</p>}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1.5 ${st.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
            {st.label}
          </span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
        >
          <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">نوبت‌های من</h1>
      </div>

      <Link href={`/customer/${params.storeCode}/book`}>
        <Button size="lg" className="w-full">رزرو نوبت جدید</Button>
      </Link>

      {appointments.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">هنوز نوبتی ندارید</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                نوبت‌های آینده
              </h2>
              {upcoming.map(a => <AppointmentCard key={a.id} a={a} />)}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">تاریخچه</h2>
              {past.map(a => <AppointmentCard key={a.id} a={a} dim />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
