'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addCustomerSchema, type AddCustomerInput } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatPersianDate } from '@/lib/persian-date'

interface Customer {
  id: string
  name: string | null
  phone: string
  displayName?: string | null
  joinedAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddCustomerInput>({
    resolver: zodResolver(addCustomerSchema),
  })

  async function fetchCustomers(q = '') {
    const res = await fetch(`/api/business/customers?q=${encodeURIComponent(q)}`)
    if (res.ok) setCustomers(await res.json())
  }

  useEffect(() => { fetchCustomers() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(search), 300)
    return () => clearTimeout(t)
  }, [search])

  async function onSubmit(data: AddCustomerInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/business/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('مشتری اضافه شد')
      reset()
      setShowForm(false)
      fetchCustomers()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  const displayName = (c: Customer) => c.displayName || c.name

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">مشتری‌ها</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{customers.length} مشتری</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'انصراف' : '+ افزودن'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">افزودن مشتری جدید</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="نام مشتری *"
              placeholder="نام و نام خانوادگی"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="شماره موبایل *"
              placeholder="09xxxxxxxxx"
              type="tel"
              dir="ltr"
              {...register('phone')}
              error={errors.phone?.message}
              hint="اگر قبلاً ثبت شده، به این بیزینس اضافه می‌شود"
            />
            <Button type="submit" loading={loading} size="lg">افزودن مشتری</Button>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="جستجو بر اساس نام یا شماره..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[44px]"
        />
      </div>

      <div className="space-y-2">
        {customers.length === 0 && (
          <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">هنوز مشتری‌ای ندارید</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">اولین مشتری خود را اضافه کنید</p>
            <Button size="sm" onClick={() => setShowForm(true)}>+ افزودن مشتری</Button>
          </div>
        )}

        {customers.length > 0 && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {customers.map((c) => {
              const name = displayName(c)
              return (
                <Link key={c.id} href={`/business/customers/${c.id}`}>
                  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--muted)] transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/15 flex items-center justify-center text-[var(--primary)] font-bold flex-shrink-0">
                      {(name || c.phone)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--foreground)] truncate">{name || '—'}</p>
                      <p className="text-sm text-[var(--muted-foreground)]" dir="ltr">{c.phone}</p>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] flex-shrink-0 hidden sm:block">
                      {formatPersianDate(c.joinedAt)}
                    </div>
                    <svg className="w-4 h-4 text-[var(--muted-foreground)] rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
