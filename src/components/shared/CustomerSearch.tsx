'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  name: string | null
  phone: string
  displayName?: string | null
}

interface CustomerSearchProps {
  customers: Customer[]
  value: string
  onChange: (customerId: string) => void
  error?: string
}

function getInitial(name: string | null | undefined, phone: string): string {
  if (name && name.trim()) return name.trim()[0]
  return phone[2] || 'م'
}

export function CustomerSearch({ customers, value, onChange, error }: CustomerSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = customers.find((c) => c.id === value)
  const displayName = selected ? (selected.displayName || selected.name || selected.phone) : ''

  const filtered = query
    ? customers.filter((c) => {
        const name = (c.displayName || c.name || '').toLowerCase()
        const q = query.toLowerCase()
        return name.includes(q) || c.phone.includes(q)
      })
    : customers

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function select(customer: Customer) {
    onChange(customer.id)
    setOpen(false)
    setQuery('')
  }

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">مشتری *</label>

      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm min-h-[44px]',
            'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
            'hover:border-[var(--primary)] transition-colors text-right',
            error && 'border-red-400'
          )}
        >
          {selected ? (
            <>
              <div className="w-7 h-7 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-xs flex-shrink-0">
                {getInitial(displayName, selected.phone)}
              </div>
              <div className="flex-1 text-right">
                <span className="font-medium">{displayName}</span>
                <span className="text-[var(--muted-foreground)] mr-2 text-xs" dir="ltr">{selected.phone}</span>
              </div>
            </>
          ) : (
            <span className="text-[var(--muted-foreground)] flex-1">انتخاب مشتری...</span>
          )}
          <svg className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="rounded-xl border border-[var(--primary)] bg-[var(--card)] shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
            <svg className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو بر اساس نام یا شماره..."
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery('') }}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                مشتری‌ای یافت نشد
              </div>
            ) : (
              filtered.map((c) => {
                const name = c.displayName || c.name
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(c)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-right',
                      'hover:bg-[var(--muted)] transition-colors',
                      value === c.id && 'bg-[var(--primary)]/10'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-bold text-sm flex-shrink-0">
                      {getInitial(name, c.phone)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {name || <span className="text-[var(--muted-foreground)]">بدون نام</span>}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]" dir="ltr">{c.phone}</p>
                    </div>
                    {value === c.id && (
                      <svg className="w-4 h-4 text-[var(--primary)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
