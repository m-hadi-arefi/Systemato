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
  onBlockedCustomer?: () => void
}

export function OtpForm({ role, referralCode, storeCode, onSuccess, onBlockedCustomer }: OtpFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const phoneFormHook = useForm<z.infer<typeof phoneForm>>({ resolver: zodResolver(phoneForm) })
  const otpFormHook = useForm<z.infer<typeof otpForm>>({ resolver: zodResolver(otpForm) })

  async function handlePhone(data: { phone: string }) {
    setLoading(true)
    try {
      // Check if this is a customer attempting owner registration
      if (role === 'BUSINESS_OWNER') {
        const check = await fetch('/api/auth/check-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: data.phone }),
        })
        if (check.ok) {
          const { role: existingRole } = await check.json()
          if (existingRole === 'CUSTOMER') {
            if (onBlockedCustomer) onBlockedCustomer()
            else router.push('/error/customer-blocked')
            return
          }
        }
      }

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, role, storeCode }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPhone(data.phone)
      setStep('otp')
      if (json.debug_code) toast(`کد تست: ${json.debug_code}`, { icon: '🔑', duration: 10000 })
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
      if (result?.error) {
        // Could be CUSTOMER trying to register as BUSINESS_OWNER
        if (role === 'BUSINESS_OWNER') {
          if (onBlockedCustomer) onBlockedCustomer()
          else router.push('/error/customer-blocked')
          return
        }
        throw new Error('کد وارد شده اشتباه است')
      }
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
        {!referralCode && role === 'BUSINESS_OWNER' && (
          <p className="text-xs text-[var(--muted-foreground)]">بدون کد دعوت — ۱ ماه رایگان</p>
        )}
        <Button type="submit" size="lg" loading={loading}>ارسال کد تأیید</Button>
      </form>
    )
  }

  return (
    <form onSubmit={otpFormHook.handleSubmit(handleOtp)} className="flex flex-col gap-4">
      <div className="bg-[var(--muted)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>کد ۴ رقمی به <span dir="ltr" className="font-mono">{phone}</span> ارسال شد</span>
      </div>
      <Input
        label="کد تأیید"
        placeholder="----"
        type="tel"
        inputMode="numeric"
        maxLength={4}
        dir="ltr"
        className="text-center text-2xl tracking-[0.5em] font-mono"
        {...otpFormHook.register('code')}
        error={otpFormHook.formState.errors.code?.message as string | undefined}
      />
      <Button type="submit" size="lg" loading={loading}>تأیید و ورود</Button>
      <button type="button" onClick={() => setStep('phone')}
        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors underline">
        تغییر شماره
      </button>
    </form>
  )
}
