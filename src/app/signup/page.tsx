'use client'

import { useSearchParams } from 'next/navigation'
import { OtpForm } from '@/components/shared/OtpForm'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import Link from 'next/link'
import { Suspense } from 'react'

function SignupContent() {
  const params = useSearchParams()
  const storeCode = params.get('store_code') || undefined
  const referralCode = params.get('ref') || undefined
  const isCustomer = !!storeCode

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="flex justify-between p-4">
        <ThemeToggle />
        <span className="text-[#0FB9B1] font-bold text-lg">Systemato</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {isCustomer ? 'ورود به بیزینس' : 'ثبت‌نام بیزینس'}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-2 text-sm">
              {isCustomer
                ? 'با شماره موبایل وارد شوید'
                : 'یک بیزینس جدید راه‌اندازی کنید'}
            </p>
          </div>
          <OtpForm
            role={isCustomer ? 'CUSTOMER' : 'BUSINESS_OWNER'}
            referralCode={referralCode}
            storeCode={storeCode}
          />
          {!isCustomer && (
            <p className="text-center text-sm mt-6 text-[var(--muted-foreground)]">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link href="/signin" className="text-[#0FB9B1] font-medium">وارد شوید</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}
