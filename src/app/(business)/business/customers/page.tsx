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

interface Customer { id: string; name: string | null; phone: string; joinedAt: string }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--foreground)]">مشتری‌ها</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'انصراف' : '+ افزودن'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input label="نام مشتری" placeholder="نام و نام خانوادگی" {...register('name')} error={errors.name?.message} />
            <Input label="شماره موبایل" placeholder="09xxxxxxxxx" type="tel" dir="ltr" {...register('phone')} error={errors.phone?.message} />
            <Button type="submit" loading={loading} className="w-full">افزودن مشتری</Button>
          </form>
        </Card>
      )}

      <Input
        placeholder="جستجو بر اساس نام یا شماره..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {customers.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <div className="text-4xl mb-3">👥</div>
            <p>هنوز مشتری‌ای ندارید</p>
          </div>
        )}
        {customers.map((c) => (
          <Link key={c.id} href={`/business/customers/${c.id}`}>
            <Card className="flex items-center gap-3 cursor-pointer hover:border-[#0FB9B1] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#0FB9B1]/20 flex items-center justify-center text-[#0FB9B1] font-bold flex-shrink-0">
                {(c.name || c.phone)[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--foreground)] truncate">{c.name || '—'}</p>
                <p className="text-sm text-[var(--muted-foreground)] dir-ltr">{c.phone}</p>
              </div>
              <svg className="w-4 h-4 text-[var(--muted-foreground)] rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
