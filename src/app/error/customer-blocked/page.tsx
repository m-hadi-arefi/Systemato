import Link from 'next/link'

export default function CustomerBlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">امکان ثبت‌نام وجود ندارد</h1>
          <p className="text-[var(--muted-foreground)] mt-3 leading-relaxed">
            شماره موبایل شما قبلاً به عنوان <strong>مشتری</strong> ثبت شده است.
            یک حساب کاربری نمی‌تواند هم مشتری و هم صاحب بیزینس باشد.
          </p>
        </div>

        <div className="bg-[var(--muted)] rounded-2xl p-4 text-sm text-[var(--muted-foreground)] text-right space-y-2">
          <p className="font-medium text-[var(--foreground)]">گزینه‌های شما:</p>
          <ul className="space-y-1 text-sm">
            <li>• با شماره موبایل دیگری ثبت‌نام کنید</li>
            <li>• با حساب فعلی به عنوان مشتری وارد شوید</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/signin"
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium text-center hover:opacity-90 transition-opacity"
          >
            ورود به حساب موجود
          </Link>
          <Link
            href="/signup"
            className="w-full py-3 border border-[var(--border)] text-[var(--foreground)] rounded-xl font-medium text-center hover:bg-[var(--muted)] transition-colors"
          >
            ثبت‌نام با شماره جدید
          </Link>
        </div>
      </div>
    </div>
  )
}
