'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessProfileSchema, type BusinessProfileInput } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
  })

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) { setLogoUrl(json.url); toast.success('لوگو آپلود شد') }
    else toast.error(json.error)
  }

  async function onSubmit(data: BusinessProfileInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logoUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('پروفایل ذخیره شد')
      router.push('/business/dashboard')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">تکمیل پروفایل بیزینس</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">اطلاعات بیزینس خود را وارد کنید</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-2xl bg-[var(--muted)] flex items-center justify-center overflow-hidden border-2 border-[var(--border)]">
            {logoUrl
              ? <img src={logoUrl} alt="لوگو" className="w-full h-full object-cover" />
              : <span className="text-4xl">🏪</span>}
          </div>
          <label className="cursor-pointer text-sm text-[#0FB9B1] font-medium">
            آپلود لوگو
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>

        <Input label="نام بیزینس *" placeholder="مثال: آرایشگاه علی" {...register('name')} error={errors.name?.message} />
        <Input label="آدرس" placeholder="آدرس کامل بیزینس" {...register('address')} error={errors.address?.message} />
        <Input label="شماره تماس" placeholder="09xxxxxxxxx" type="tel" dir="ltr" {...register('phone')} error={errors.phone?.message} />
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">توضیح کوتاه</label>
          <textarea
            {...register('description')}
            placeholder="توضیح مختصری درباره بیزینس خود بنویسید..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#0FB9B1] resize-none text-sm"
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="ساعت باز" placeholder="09:00" {...register('workingHours.open')} error={errors.workingHours?.open?.message} />
          <Input label="ساعت بسته" placeholder="21:00" {...register('workingHours.close')} error={errors.workingHours?.close?.message} />
        </div>

        <Button type="submit" size="lg" loading={loading}>ذخیره و شروع</Button>
      </form>
    </div>
  )
}
