'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const DAYS = [
  { key: 'sat', label: 'شنبه' },
  { key: 'sun', label: 'یکشنبه' },
  { key: 'mon', label: 'دوشنبه' },
  { key: 'tue', label: 'سه‌شنبه' },
  { key: 'wed', label: 'چهارشنبه' },
  { key: 'thu', label: 'پنجشنبه' },
  { key: 'fri', label: 'جمعه' },
] as const

type DayKey = typeof DAYS[number]['key']

interface TimeRange {
  open: string
  close: string
}

interface DaySchedule {
  closed: boolean
  ranges: TimeRange[]
}

type WorkingHours = Partial<Record<DayKey, DaySchedule>>

interface WorkingHoursPickerProps {
  value?: WorkingHours
  onChange: (value: WorkingHours) => void
}

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      dir="ltr"
    >
      {TIME_OPTIONS.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )
}

export function WorkingHoursPicker({ value = {}, onChange }: WorkingHoursPickerProps) {
  const [expanded, setExpanded] = useState<DayKey | null>(null)

  function getDay(key: DayKey): DaySchedule {
    return value[key] ?? { closed: false, ranges: [{ open: '09:00', close: '18:00' }] }
  }

  function updateDay(key: DayKey, update: Partial<DaySchedule>) {
    const current = getDay(key)
    onChange({ ...value, [key]: { ...current, ...update } })
  }

  function addRange(key: DayKey) {
    const day = getDay(key)
    updateDay(key, { ranges: [...day.ranges, { open: '09:00', close: '18:00' }] })
  }

  function removeRange(key: DayKey, idx: number) {
    const day = getDay(key)
    updateDay(key, { ranges: day.ranges.filter((_, i) => i !== idx) })
  }

  function updateRange(key: DayKey, idx: number, field: 'open' | 'close', val: string) {
    const day = getDay(key)
    const ranges = [...day.ranges]
    ranges[idx] = { ...ranges[idx], [field]: val }
    updateDay(key, { ranges })
  }

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = getDay(key)
        const isOpen = expanded === key

        return (
          <div key={key} className={cn(
            'rounded-xl border transition-all duration-150',
            day.closed
              ? 'border-[var(--border)] bg-[var(--muted)] opacity-70'
              : 'border-[var(--border)] bg-[var(--card)]'
          )}>
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => !day.closed && setExpanded(isOpen ? null : key)}
            >
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <div
                    className={cn(
                      'w-10 h-5 rounded-full transition-all duration-200 relative',
                      day.closed ? 'bg-[var(--border)]' : 'bg-[var(--primary)]'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      updateDay(key, { closed: !day.closed })
                      if (!day.closed) setExpanded(null)
                    }}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
                      day.closed ? 'right-0.5' : 'left-0.5'
                    )} />
                  </div>
                </label>
                <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
              </div>

              <div className="flex items-center gap-2">
                {!day.closed && day.ranges.length > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)]" dir="ltr">
                    {day.ranges[0].open} – {day.ranges[0].close}
                    {day.ranges.length > 1 && ` +${day.ranges.length - 1}`}
                  </span>
                )}
                {day.closed && (
                  <span className="text-xs text-[var(--muted-foreground)]">تعطیل</span>
                )}
                {!day.closed && (
                  <svg
                    className={cn('w-4 h-4 text-[var(--muted-foreground)] transition-transform', isOpen && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {isOpen && !day.closed && (
              <div className="px-4 pb-4 space-y-2 border-t border-[var(--border)]">
                <div className="pt-3 space-y-2">
                  {day.ranges.map((range, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TimeSelect value={range.open} onChange={(v) => updateRange(key, idx, 'open', v)} />
                      <span className="text-[var(--muted-foreground)] text-sm">تا</span>
                      <TimeSelect value={range.close} onChange={(v) => updateRange(key, idx, 'close', v)} />
                      {day.ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRange(key, idx)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addRange(key)}
                  className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  افزودن بازه زمانی
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
