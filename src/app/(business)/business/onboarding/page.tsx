'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessProfileSchema, type BusinessProfileInput, type WorkingHours } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { WorkingHoursPicker } from '@/components/business/WorkingHoursPicker'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STEPS = ['basic', 'hours'] as const
type Step = typeof STEPS[number]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [step, setStep] = useState<Step>('basic')

  const { register, handleSubmit, control, formState: { errors } } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      workingHours: {},
    },
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
        <p className="text-[var(--muted-foreground)] text-sm mt-1">اطلاعات کسب‌وکار خود را وارد کنید</p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              STEPS.indexOf(step) >= i ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 'basic' && (
          <>
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl bg-[var(--muted)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
                {logoUrl
                  ? <img src={logoUrl} alt="لوگو" className="w-full h-full object-cover" />
                  : <span className="text-4xl">🏪</span>}
              </div>
              <label className="cursor-pointer text-sm text-[var(--primary)] font-medium hover:underline">
                آپلود لوگو
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            <Input
              label="نام بیزینس *"
              placeholder="مثال: آرایشگاه علی"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="شماره تماس"
              placeholder="09xxxxxxxxx"
              type="tel"
              dir="ltr"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">توضیح کوتاه</label>
              <textarea
                {...register('description')}
                placeholder="توضیح مختصری درباره کسب‌وکار خود..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            <Button
              type="button"
              size="lg"
              onClick={() => setStep('hours')}
            >
              ادامه
            </Button>
          </>
        )}

        {step === 'hours' && (
          <>
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">ساعات کاری</h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">روزهایی که باز هستید را مشخص کنید</p>
            </div>

            <Controller
              control={control}
              name="workingHours"
              render={({ field }) => (
                <WorkingHoursPicker
                  value={field.value as WorkingHours}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep('basic')}>
                برگشت
              </Button>
              <Button type="submit" size="lg" loading={loading} className="flex-1">
                ذخیره و شروع
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
