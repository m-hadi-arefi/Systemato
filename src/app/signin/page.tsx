import { OtpForm } from '@/components/shared/OtpForm'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="flex justify-between p-4">
        <ThemeToggle />
        <span className="text-[#0FB9B1] font-bold text-lg">Systemato</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">ورود به سیستماتو</h1>
            <p className="text-[var(--muted-foreground)] mt-2 text-sm">
              با شماره موبایل وارد شوید
            </p>
          </div>
          <OtpForm role="BUSINESS_OWNER" />
          <p className="text-center text-sm mt-6 text-[var(--muted-foreground)]">
            صاحب بیزینس هستید؟{' '}
            <Link href="/signup" className="text-[#0FB9B1] font-medium">ثبت‌نام کنید</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
