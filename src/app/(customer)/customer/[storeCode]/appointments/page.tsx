'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const statusInfo: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'در انتظار تأیید', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  CONFIRMED: { label: 'تأیید شده', color: 'bg-green-100 text-green-700', icon: '✅' },
  DONE: { label: 'انجام شده', color: 'bg-blue-100 text-blue-700', icon: '🎯' },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700', icon: '❌' },
}

interface Appointment {
  id: string; datetime: string; status: string; note: string | null
  business: { name: string; storeCode: string }
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

  const upcoming = appointments.filter(a => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.datetime) >= new Date())
  const past = appointments.filter(a => !upcoming.includes(a))

  if (loading) return <div className="flex items-center justify-center h-40 text-2xl">⏳</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[var(--muted-foreground)] text-xl">←</button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">نوبت‌های من</h1>
      </div>

      <Link href={`/customer/${params.storeCode}/book`}>
        <Button size="lg" className="w-full">📅 رزرو نوبت جدید</Button>
      </Link>

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">نوبت‌های آینده</h2>
          {upcoming.map(a => {
            const s = statusInfo[a.status]
            return (
              <Card key={a.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {new Date(a.datetime).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {a.note && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.note}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>
                    {s.icon} {s.label}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)]">تاریخچه</h2>
          {past.map(a => {
            const s = statusInfo[a.status]
            return (
              <Card key={a.id} className="opacity-70">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--foreground)]">
                    {new Date(a.datetime).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>
                    {s.icon} {s.label}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <div className="text-4xl mb-3">📅</div>
          <p>هنوز نوبتی ندارید</p>
        </div>
      )}
    </div>
  )
}
