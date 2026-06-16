'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createServiceSchema, type CreateServiceInput } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import toast from 'react-hot-toast'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
  active: boolean
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقیقه`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} ساعت و ${m} دقیقه` : `${h} ساعت`
}

function formatPrice(price: number | null): string {
  if (!price) return 'رایگان'
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { active: true },
  })

  async function fetchServices() {
    const res = await fetch('/api/business/services')
    if (res.ok) setServices(await res.json())
  }

  useEffect(() => { fetchServices() }, [])

  async function onSubmit(data: CreateServiceInput) {
    setLoading(true)
    try {
      const url = editingId ? `/api/business/services/${editingId}` : '/api/business/services'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(editingId ? 'خدمت بروز شد' : 'خدمت اضافه شد')
      reset()
      setShowForm(false)
      setEditingId(null)
      fetchServices()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id)
    setValue('name', s.name)
    setValue('description', s.description || '')
    setValue('duration', s.duration)
    setValue('price', s.price || undefined)
    setValue('active', s.active)
    setShowForm(true)
  }

  function cancelForm() {
    reset()
    setShowForm(false)
    setEditingId(null)
  }

  async function toggleActive(s: Service) {
    setTogglingId(s.id)
    try {
      const res = await fetch(`/api/business/services/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !s.active }),
      })
      if (!res.ok) throw new Error()
      fetchServices()
    } catch {
      toast.error('خطا در بروزرسانی')
    } finally {
      setTogglingId(null)
    }
  }

  async function deleteService(id: string) {
    if (!confirm('آیا از حذف این خدمت اطمینان دارید؟')) return
    const res = await fetch(`/api/business/services/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('خدمت حذف شد'); fetchServices() }
    else toast.error('خطا در حذف')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">خدمات</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">خدمات کسب‌وکار خود را مدیریت کنید</p>
        </div>
        <Button size="sm" onClick={() => { setEditingId(null); reset(); setShowForm(!showForm) }}>
          {showForm ? 'انصراف' : '+ خدمت جدید'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            {editingId ? 'ویرایش خدمت' : 'خدمت جدید'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="نام خدمت *"
              placeholder="مثال: کوتاهی مو"
              {...register('name')}
              error={errors.name?.message}
            />

            <div>
              <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">توضیحات</label>
              <textarea
                {...register('description')}
                placeholder="توضیح کوتاه درباره این خدمت..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="مدت زمان (دقیقه) *"
                type="number"
                min={5}
                max={480}
                step={5}
                placeholder="30"
                {...register('duration', { valueAsNumber: true })}
                error={errors.duration?.message}
                dir="ltr"
              />
              <Input
                label="قیمت (تومان)"
                type="number"
                min={0}
                step={1000}
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
                error={errors.price?.message}
                dir="ltr"
                hint="خالی = رایگان"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" loading={loading} className="flex-1">
                {editingId ? 'ذخیره تغییرات' : 'افزودن خدمت'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>انصراف</Button>
            </div>
          </form>
        </Card>
      )}

      {services.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-[var(--foreground)]">خدماتی ندارید</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-4">اولین خدمت کسب‌وکارتان را اضافه کنید</p>
          <Button size="sm" onClick={() => setShowForm(true)}>+ افزودن خدمت</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--foreground)]">{s.name}</span>
                    {!s.active && (
                      <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded-full">غیرفعال</span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{s.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(s.duration)}
                    </span>
                    <span className="text-sm font-medium text-[var(--primary)]">{formatPrice(s.price)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(s)}
                    disabled={togglingId === s.id}
                    className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title={s.active ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {s.active
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      }
                    </svg>
                  </button>
                  <button
                    onClick={() => startEdit(s)}
                    className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteService(s.id)}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
