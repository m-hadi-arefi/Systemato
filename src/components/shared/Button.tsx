import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({
  variant = 'primary', size = 'md', loading, className, children, disabled, ...props
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-xl transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'select-none',
  ].join(' ')

  const variants = {
    primary: 'bg-[var(--primary)] hover:opacity-90 text-white focus-visible:ring-[var(--primary)] shadow-sm active:scale-[0.98]',
    secondary: 'bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] focus-visible:ring-[var(--border)]',
    outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-[var(--border)]',
    ghost: 'bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-[var(--border)]',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500 shadow-sm active:scale-[0.98]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[34px]',
    md: 'px-4 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-base min-h-[52px] w-full',
    icon: 'p-2 min-h-[36px] min-w-[36px]',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
