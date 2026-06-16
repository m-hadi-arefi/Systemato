import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--card)] rounded-2xl border border-[var(--border)]',
        'shadow-sm transition-all duration-150',
        hover && 'hover:shadow-md hover:border-[var(--primary)] cursor-pointer hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
