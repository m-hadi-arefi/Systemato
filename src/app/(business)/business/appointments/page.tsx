'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAppointmentSchema, type CreateAppointmentInput } from '@/lib/validations/appointment'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import toast from 'react-hot-toast'

type Status = 'ALL' | 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED'

const tabs: { key: Status; label: string }[] = [
  { key: 'ALL', label: 'همه' },
  { key: 'PENDING', label: 'در انتظار' },
  { key: 'CONFIRMED', label: 'تأیید شده' },
  { key: 'DONE', label: 'انجام شده' },
  { key: 'CANCELLED', label: 'لغو' },
]

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DONE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Appointment {
  id: string; datetime: string; status: string; note: string | null
  customer: { id: string; name: string | null; phone: string }
}
interface Customer { id: string; name: string | null; phone: string }

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Status>('ALL')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
  })

  async function fetchAppointments() {
    const params = tab !== 'ALL' ? `?status=${tab}` : ''
    const res = await fetch(`/api/business/appointments${params}`)
    if (res.ok) setAppointments(await res.json())
  }

  useEffect(() => { fetchAppointments() }, [tab])
  useEffect(() => {
    fetch('/api/business/customers').then(r => r.json()).then(setCustomers)
  }, [])

  async function onSubmit(data: CreateAppointmentInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/business/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('نوبت ثبت شد')
      reset(); setShowForm(false); fetchAppointments()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/business/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success('وضعیت بروز شد'); fetchAppointments() }
    else toast.error('خطا در بروزرسانی')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--foreground)]">نوبت‌ها</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'انصراف' : '+ نوبت جدید'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">مشتری *</label>
              <select
                {...register('customerId')}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#0FB9B1] min-h-[48px]"
              >
                <option value="">انتخاب مشتری...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.phone}</option>
                ))}
              </select>
              {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
            </div>
            <Input label="تاریخ و ساعت *" type="datetime-local" {...register('datetime')} error={errors.datetime?.message} />
            <Input label="یادداشت" placeholder="اختیاری" {...register('note')} />
            <Button type="submit" loading={loading} className="w-full">ثبت نوبت</Button>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-[#0FB9B1] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {appointments.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <div className="text-4xl mb-3">📅</div>
            <p>نوبتی وجود ندارد</p>
          </div>
        )}
        {appointments.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--foreground)]">
                  {a.customer.name || a.customer.phone}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                  {new Date(a.datetime).toLocaleString('fa-IR')}
                </p>
                {a.note && <p className="text-xs text-[var(--muted-foreground)] mt-1">{a.note}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusStyles[a.status]}`}>
                {tabs.find(t => t.key === a.status)?.label || a.status}
              </span>
            </div>
            {a.status === 'PENDING' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => updateStatus(a.id, 'CONFIRMED')} className="flex-1">تأیید</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'CANCELLED')} className="flex-1 !border-red-500 !text-red-500 hover:!bg-red-500">رد</Button>
              </div>
            )}
            {a.status === 'CONFIRMED' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => updateStatus(a.id, 'DONE')} className="flex-1">انجام شد</Button>
                <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, 'CANCELLED')} className="flex-1">لغو</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
