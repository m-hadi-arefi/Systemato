import { BusinessNav } from '@/components/business/BusinessNav'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <BusinessNav />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)] md:hidden sticky top-0 z-40">
          <div className="w-9" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--primary)] rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-[var(--foreground)]">Systemato</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between px-6 py-3.5 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-40">
          <div />
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 pb-24 md:pb-6 md:p-8 max-w-5xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
