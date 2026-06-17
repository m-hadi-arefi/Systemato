'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSmartRefresh } from '@/hooks/useSmartRefresh'
import { formatPersianDateTime } from '@/lib/persian-date'

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'در انتظار', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'تأیید شده', color: 'bg-green-100 text-green-700' },
  DONE: { label: 'انجام شده', color: 'bg-blue-100 text-blue-700' },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700' },
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<{ customer: { id: string; name: string | null; phone: string }; appointments: Array<{ id: string; datetime: string; status: string; note: string | null }> } | null>(null)

  const fetchData = useCallback(async () => {
    fetch(`/api/business/customers/${params.id}`).then(r => r.json()).then(setData)
  }, [params.id])

  useEffect(() => { fetchData() }, [fetchData])
  useSmartRefresh(fetchData)

  if (!data) return <div className="flex items-center justify-center h-40"><div className="animate-spin text-2xl">⏳</div></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[var(--muted-foreground)]">←</button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">{data.customer.name || data.customer.phone}</h1>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#0FB9B1]/20 flex items-center justify-center text-[#0FB9B1] text-2xl font-bold">
            {(data.customer.name || data.customer.phone)[0]}
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">{data.customer.name || '—'}</p>
            <p className="text-sm text-[var(--muted-foreground)]" dir="ltr">{data.customer.phone}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--foreground)]">تاریخچه نوبت‌ها</h2>
        <Link href={`/business/appointments?customer=${params.id}`}>
          <Button size="sm">+ نوبت جدید</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {data.appointments.length === 0 && (
          <p className="text-center text-[var(--muted-foreground)] py-8">نوبتی ثبت نشده</p>
        )}
        {data.appointments.map((a) => {
          const s = statusLabels[a.status]
          return (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {formatPersianDateTime(a.datetime)}
                </p>
                {a.note && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.note}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
