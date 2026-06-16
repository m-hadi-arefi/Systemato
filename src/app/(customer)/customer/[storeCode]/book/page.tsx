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

export default function BookPage({ params }: { params: { storeCode: string } }) {
  const router = useRouter()
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CustomerBookInput>({
    resolver: zodResolver(customerBookSchema),
  })

  useEffect(() => {
    fetch(`/api/customer/businesses/${params.storeCode}`)
      .then(r => r.json())
      .then(data => {
        setBusinessId(data.id)
        setValue('businessId', data.id)
      })
  }, [params.storeCode, setValue])

  async function onSubmit(data: CustomerBookInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/customer/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    <div className="max-w-sm mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[var(--muted-foreground)] text-xl">←</button>
        <h1 className="text-xl font-bold text-[var(--foreground)]">رزرو نوبت</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('businessId')} value={businessId} />
          <Input
            label="تاریخ و ساعت *"
            type="datetime-local"
            {...register('datetime')}
            error={errors.datetime?.message}
          />
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">یادداشت (اختیاری)</label>
            <textarea
              {...register('note')}
              placeholder="هر توضیحی که لازم است..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#0FB9B1] resize-none text-sm"
            />
          </div>

          <div className="bg-[var(--muted)] rounded-xl p-3 text-sm text-[var(--muted-foreground)]">
            💡 نوبت شما پس از تأیید توسط بیزینس فعال می‌شود
          </div>

          <Button type="submit" size="lg" loading={loading} disabled={!businessId}>
            ثبت درخواست نوبت
          </Button>
        </form>
      </Card>
    </div>
  )
}
