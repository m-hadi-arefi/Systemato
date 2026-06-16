import { BusinessNav } from '@/components/business/BusinessNav'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <BusinessNav />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)] md:hidden">
          <ThemeToggle />
          <span className="text-[#0FB9B1] font-bold text-lg">Systemato</span>
          <div className="w-9" />
        </header>
        <main className="flex-1 p-4 pb-24 md:pb-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
