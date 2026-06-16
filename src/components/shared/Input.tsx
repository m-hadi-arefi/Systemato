import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-[var(--foreground)]">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 min-h-[48px] rounded-xl border bg-[var(--card)] text-[var(--foreground)]',
            'border-[var(--border)] placeholder:text-[var(--muted-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[#0FB9B1] focus:border-transparent',
            'transition-all text-base',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
