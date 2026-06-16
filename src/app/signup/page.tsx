'use client'

import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import Link from 'next/link'
import { Suspense } from 'react'
import { OtpForm } from '@/components/shared/OtpForm'

function SignupContent() {
  const params = useSearchParams()
  const storeCode = params.get('store_code') || undefined
  const referralCode = params.get('ref') || undefined
  const isCustomer = !!storeCode

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="flex justify-between items-center p-4">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-[var(--foreground)]">Systemato</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              {isCustomer ? (
                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {isCustomer ? 'ورود به بیزینس' : 'ثبت‌نام بیزینس'}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-2 text-sm">
              {isCustomer
                ? 'شماره موبایل خود را وارد کنید'
                : 'کسب‌وکار خود را به سیستماتو اضافه کنید'}
            </p>
          </div>

          {referralCode && !isCustomer && (
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl px-4 py-3 mb-4 text-sm text-[var(--primary)] flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              با کد دعوت: ۳ ماه رایگان دارید
            </div>
          )}

          <OtpForm
            role={isCustomer ? 'CUSTOMER' : 'BUSINESS_OWNER'}
            referralCode={referralCode}
            storeCode={storeCode}
            onBlockedCustomer={() => {
              window.location.href = '/error/customer-blocked'
            }}
          />

          {!isCustomer && (
            <p className="text-center text-sm mt-6 text-[var(--muted-foreground)]">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link href="/signin" className="text-[var(--primary)] font-medium hover:underline">وارد شوید</Link>
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
