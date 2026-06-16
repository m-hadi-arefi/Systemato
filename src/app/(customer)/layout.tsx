import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)]">
        <ThemeToggle />
        <span className="text-[#0FB9B1] font-bold text-lg">Systemato</span>
        <div className="w-9" />
      </header>
      <main className="p-4 pb-8">{children}</main>
    </div>
  )
}
