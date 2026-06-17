import {
  format,
  isToday as isTodayFns,
  isTomorrow as isTomorrowFns,
} from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date
}

export function formatPersianDate(date: Date | string): string {
  return format(toDate(date), 'd MMMM yyyy', { locale: faIR })
}

export function formatPersianDateTime(date: Date | string): string {
  return format(toDate(date), 'd MMMM yyyy،‏ HH:mm', { locale: faIR })
}

export function formatPersianTime(date: Date | string): string {
  return format(toDate(date), 'HH:mm')
}

export function formatPersianShortDate(date: Date | string): string {
  return format(toDate(date), 'd MMMM', { locale: faIR })
}

export function getPersianDayName(date: Date | string): string {
  return format(toDate(date), 'EEEE', { locale: faIR })
}

export function isToday(date: Date | string): boolean {
  return isTodayFns(toDate(date))
}

export function isTomorrow(date: Date | string): boolean {
  return isTomorrowFns(toDate(date))
}

export function formatRelativePersian(date: Date | string): string {
  const d = toDate(date)
  if (isToday(d)) return `امروز ${formatPersianTime(d)}`
  if (isTomorrow(d)) return `فردا ${formatPersianTime(d)}`
  return formatPersianDateTime(d)
}

export const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

export const PERSIAN_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
