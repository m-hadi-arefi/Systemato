// Persian (Jalali) date utilities

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const PERSIAN_DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

export function formatPersianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatPersianDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPersianTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPersianShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
  })
}

export function getPersianDayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fa-IR', { weekday: 'long' })
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.toDateString() === tomorrow.toDateString()
}

export function formatRelativePersian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return `امروز ${formatPersianTime(d)}`
  if (isTomorrow(d)) return `فردا ${formatPersianTime(d)}`
  return formatPersianDateTime(d)
}

export { PERSIAN_MONTHS, PERSIAN_DAYS }
