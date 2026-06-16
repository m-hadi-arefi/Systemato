import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
