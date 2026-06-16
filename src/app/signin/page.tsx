import { OtpForm } from '@/components/shared/OtpForm'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="flex justify-between items-center p-4">
        <ThemeToggle />
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#0FB9B1] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-[var(--foreground)]">Systemato</span>
        </Link>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0FB9B1]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0FB9B1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">ورود به سیستماتو</h1>
            <p className="text-[var(--muted-foreground)] mt-2 text-sm">
              با شماره موبایل وارد شوید
            </p>
          </div>

          <OtpForm role="BUSINESS_OWNER" />

          <p className="text-center text-sm mt-6 text-[var(--muted-foreground)]">
            صاحب بیزینس هستید و ثبت‌نام نکرده‌اید؟{' '}
            <Link href="/signup" className="text-[#0FB9B1] font-medium hover:underline">ثبت‌نام کنید</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
