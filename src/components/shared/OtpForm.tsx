'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from './Input'
import { Button } from './Button'
import { phoneSchema } from '@/lib/validations/auth'

const phoneForm = z.object({ phone: phoneSchema })
const otpForm = z.object({ code: z.string().length(4, 'کد ۴ رقمی است') })

interface OtpFormProps {
  role: 'BUSINESS_OWNER' | 'CUSTOMER'
  referralCode?: string
  storeCode?: string
  onSuccess?: (role: string) => void
}

export function OtpForm({ role, referralCode, storeCode, onSuccess }: OtpFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const phoneFormHook = useForm<z.infer<typeof phoneForm>>({ resolver: zodResolver(phoneForm) })
  const otpFormHook = useForm<z.infer<typeof otpForm>>({ resolver: zodResolver(otpForm) })

  async function handlePhone(data: { phone: string }) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, role, storeCode }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPhone(data.phone)
      setStep('otp')
      if (json.debug_code) toast(`کد تست: ${json.debug_code}`, { icon: '🔑' })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا در ارسال کد')
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(data: { code: string }) {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        phone, code: data.code, role, referralCode, storeCode, redirect: false,
      })
      if (result?.error) throw new Error('کد وارد شده اشتباه است')
      toast.success('ورود موفق')
      if (onSuccess) {
        onSuccess(role)
      } else {
        router.push(role === 'BUSINESS_OWNER' ? '/business/dashboard' : '/customer')
        router.refresh()
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا در تأیید')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={phoneFormHook.handleSubmit(handlePhone)} className="flex flex-col gap-4">
        <Input
          label="شماره موبایل"
          placeholder="09xxxxxxxxx"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          {...phoneFormHook.register('phone')}
          error={phoneFormHook.formState.errors.phone?.message as string | undefined}
        />
        {referralCode && (
          <div className="bg-[#0FB9B1]/10 text-[#0FB9B1] px-4 py-3 rounded-xl text-sm">
            🎁 با کد دعوت ثبت‌نام می‌کنید — ۳ ماه رایگان دارید
          </div>
        )}
        {!referralCode && role === 'BUSINESS_OWNER' && (
          <p className="text-sm text-[var(--muted-foreground)]">بدون کد دعوت — ۱ ماه رایگان</p>
        )}
        <Button type="submit" size="lg" loading={loading}>ارسال کد تأیید</Button>
      </form>
    )
  }

  return (
    <form onSubmit={otpFormHook.handleSubmit(handleOtp)} className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted-foreground)]">کد ۴ رقمی ارسال‌شده به {phone} را وارد کنید</p>
      <Input
        label="کد تأیید"
        placeholder="----"
        type="tel"
        inputMode="numeric"
        maxLength={4}
        dir="ltr"
        className="text-center text-2xl tracking-widest"
        {...otpFormHook.register('code')}
        error={otpFormHook.formState.errors.code?.message as string | undefined}
      />
      <Button type="submit" size="lg" loading={loading}>تأیید و ورود</Button>
      <button type="button" onClick={() => setStep('phone')}
        className="text-sm text-[var(--muted-foreground)] underline">
        تغییر شماره
      </button>
    </form>
  )
}
