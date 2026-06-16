'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/business/dashboard', label: 'داشبورد', icon: '🏠' },
  { href: '/business/customers', label: 'مشتری‌ها', icon: '👥' },
  { href: '/business/appointments', label: 'نوبت‌ها', icon: '📅' },
  { href: '/business/profile', label: 'پروفایل', icon: '🏪' },
]

export function BusinessNav() {
  const path = usePathname()

  return (
    <>
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[var(--card)] border-l border-[var(--border)] p-4 gap-2">
        <div className="py-4 px-2 mb-4">
          <span className="text-[#0FB9B1] font-bold text-xl">Systemato</span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              path === item.href
                ? 'bg-[#0FB9B1] text-white'
                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </aside>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 right-0 left-0 z-50 bg-[var(--card)] border-t border-[var(--border)]">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-4 flex-1 text-xs transition-colors',
                path === item.href ? 'text-[#0FB9B1]' : 'text-[var(--muted-foreground)]'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
