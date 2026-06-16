'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerBookSchema, type CustomerBookInput } from '@/lib/validations/appointment'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Service { id: string; name: string; duration: number; price: number | null }
interface Business { id: string; name: string; services: Service[]; primaryColor?: string; secondaryColor?: string }

export default function BookPage({ params }: { params: { storeCode: string } }) {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CustomerBookInput>({
    resolver: zodResolver(customerBookSchema),
  })

  useEffect(() => {
    fetch(`/api/customer/businesses/${params.storeCode}`)
      .then(r => r.json())
      .then(data => {
        setBusiness(data)
        setValue('businessId', data.id)
      })
  }, [params.storeCode, setValue])

  async function onSubmit(data: CustomerBookInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/customer/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, serviceId: selectedService || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('درخواست نوبت ثبت شد')
      router.push(`/customer/${params.storeCode}/appointments`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)] transition-colors"
        >
          <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">رزرو نوبت</h1>
          {business && <p className="text-sm text-[var(--muted-foreground)]">{business.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('businessId')} />

        {/* Service selection */}
        {business?.services && business.services.length > 0 && (
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">انتخاب خدمت</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedService('')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-right transition-all ${
                  !selectedService
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  !selectedService ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
                }`} />
                <span className="text-sm text-[var(--muted-foreground)]">بدون خدمت مشخص</span>
              </button>
              {business.services.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-right transition-all ${
                    selectedService === s.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    selectedService === s.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{s.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{s.duration} دقیقه</p>
                  </div>
                  {s.price && (
                    <span className="text-sm font-semibold text-[var(--primary)] flex-shrink-0">
                      {new Intl.NumberFormat('fa-IR').format(s.price)} ت
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="تاریخ و ساعت *"
          type="datetime-local"
          {...register('datetime')}
          error={errors.datetime?.message}
          dir="ltr"
        />

        <div>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">یادداشت (اختیاری)</label>
          <textarea
            {...register('note')}
            placeholder="هر توضیحی که لازم است..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>

        <div className="bg-[var(--muted)] rounded-xl p-3 text-sm text-[var(--muted-foreground)] flex items-start gap-2">
          <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          نوبت شما پس از تأیید توسط بیزینس فعال می‌شود
        </div>

        <Button type="submit" size="lg" loading={loading} disabled={!business}>
          ثبت درخواست نوبت
        </Button>
      </form>
    </div>
  )
}
