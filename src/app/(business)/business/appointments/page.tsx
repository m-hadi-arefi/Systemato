'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAppointmentSchema, type CreateAppointmentInput } from '@/lib/validations/appointment'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { CustomerSearch } from '@/components/shared/CustomerSearch'
import toast from 'react-hot-toast'
import { formatRelativePersian } from '@/lib/persian-date'

type Status = 'ALL' | 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED'

const tabs: { key: Status; label: string }[] = [
  { key: 'ALL', label: 'همه' },
  { key: 'PENDING', label: 'در انتظار' },
  { key: 'CONFIRMED', label: 'تأیید شده' },
  { key: 'DONE', label: 'انجام شده' },
  { key: 'CANCELLED', label: 'لغو' },
]

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'در انتظار', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-400' },
  CONFIRMED: { label: 'تأیید شده', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-400' },
  DONE: { label: 'انجام شده', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dot: 'bg-blue-400' },
  CANCELLED: { label: 'لغو', color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-400' },
}

interface Service { id: string; name: string; duration: number }
interface Appointment {
  id: string; datetime: string; status: string; note: string | null
  customer: { id: string; name: string | null; phone: string }
  service: { id: string; name: string; duration: number } | null
}
interface Customer { id: string; name: string | null; phone: string; displayName?: string | null }

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Status>('ALL')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
  })

  const customerId = watch('customerId') || ''

  async function fetchAppointments() {
    const params = tab !== 'ALL' ? `?status=${tab}` : ''
    const res = await fetch(`/api/business/appointments${params}`)
    if (res.ok) setAppointments(await res.json())
  }

  useEffect(() => { fetchAppointments() }, [tab])

  useEffect(() => {
    fetch('/api/business/customers').then(r => r.json()).then(setCustomers)
    fetch('/api/business/services').then(r => r.json()).then((data: Service[]) => setServices(data.filter(s => (s as unknown as { active: boolean }).active !== false)))
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

  const filtered = tab === 'ALL' ? appointments : appointments.filter(a => a.status === tab)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">نوبت‌ها</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{filtered.length} نوبت</p>
        </div>
        <Button size="sm" onClick={() => { setShowForm(!showForm); reset() }}>
          {showForm ? 'انصراف' : '+ نوبت جدید'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">ثبت نوبت جدید</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CustomerSearch
              customers={customers}
              value={customerId}
              onChange={(id) => setValue('customerId', id)}
              error={errors.customerId?.message}
            />

            {services.length > 0 && (
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">خدمت (اختیاری)</label>
                <select
                  {...register('serviceId')}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[44px]"
                >
                  <option value="">بدون خدمت مشخص</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration} دقیقه)</option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="تاریخ و ساعت *"
              type="datetime-local"
              {...register('datetime')}
              error={errors.datetime?.message}
              dir="ltr"
            />
            <Input label="یادداشت" placeholder="اختیاری" {...register('note')} />
            <Button type="submit" loading={loading} size="lg">ثبت نوبت</Button>
          </form>
        </Card>
      )}

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
              tab === t.key
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">نوبتی در این بخش وجود ندارد</p>
          </div>
        )}

        {filtered.map((a) => {
          const st = statusConfig[a.status] || { label: a.status, color: '', dot: '' }
          return (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] font-bold flex-shrink-0">
                    {(a.customer.name || a.customer.phone)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)]">{a.customer.name || a.customer.phone}</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                      {formatRelativePersian(a.datetime)}
                    </p>
                    {a.service && (
                      <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full mt-1 inline-block">
                        {a.service.name}
                      </span>
                    )}
                    {a.note && <p className="text-xs text-[var(--muted-foreground)] mt-1">{a.note}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1.5 ${st.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>

              {a.status === 'PENDING' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                  <Button size="sm" onClick={() => updateStatus(a.id, 'CONFIRMED')} className="flex-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    تأیید
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => updateStatus(a.id, 'CANCELLED')} className="flex-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    رد کردن
                  </Button>
                </div>
              )}
              {a.status === 'CONFIRMED' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                  <Button size="sm" onClick={() => updateStatus(a.id, 'DONE')} className="flex-1">انجام شد</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'CANCELLED')} className="flex-1">لغو</Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
