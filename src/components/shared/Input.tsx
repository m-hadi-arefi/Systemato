import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full min-h-[44px] px-4 py-2.5 rounded-xl text-sm',
              'border bg-[var(--card)] text-[var(--foreground)]',
              'border-[var(--border)] placeholder:text-[var(--muted-foreground)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pr-10',
              error && 'border-red-400 focus:ring-red-400',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
