'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessProfileSchema, type BusinessProfileInput } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [storeCode, setStoreCode] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
  })

  useEffect(() => {
    fetch('/api/business/profile').then(r => r.json()).then(data => {
      reset({
        name: data.name,
        address: data.address || '',
        phone: data.phone || '',
        description: data.description || '',
        workingHours: data.workingHours,
      })
      setStoreCode(data.storeCode)
      setLogoUrl(data.logoUrl || '')
    })
  }, [reset])

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?store_code=${storeCode}`
    : `/signup?store_code=${storeCode}`

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) { setLogoUrl(json.url); toast.success('لوگو آپلود شد') }
    else toast.error(json.error)
  }

  async function onSubmit(data: BusinessProfileInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logoUrl }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('پروفایل ذخیره شد')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('لینک کپی شد')
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[var(--foreground)]">پروفایل بیزینس</h1>

      {/* QR Card */}
      {storeCode && (
        <Card className="text-center space-y-4">
          <h2 className="font-semibold text-[var(--foreground)]">کد دعوت مشتری</h2>
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-xl">
              <QRCodeSVG value={inviteUrl} size={160} fgColor="#1D1D1D" />
            </div>
          </div>
          <div className="bg-[var(--muted)] rounded-xl px-4 py-3 text-sm font-mono" dir="ltr">
            {storeCode}
          </div>
          <Button variant="outline" onClick={copyLink} className="w-full">
            {copied ? '✅ کپی شد' : '🔗 کپی لینک دعوت'}
          </Button>
        </Card>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-xl bg-[var(--muted)] overflow-hidden border border-[var(--border)]">
            {logoUrl
              ? <img src={logoUrl} alt="لوگو" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>}
          </div>
          <label className="cursor-pointer text-sm text-[#0FB9B1] font-medium">
            تغییر لوگو
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>

        <Input label="نام بیزینس *" {...register('name')} error={errors.name?.message} />
        <Input label="آدرس" {...register('address')} />
        <Input label="شماره تماس" type="tel" dir="ltr" {...register('phone')} error={errors.phone?.message} />
        <div>
          <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">توضیح</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#0FB9B1] resize-none text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="ساعت باز" placeholder="09:00" {...register('workingHours.open')} />
          <Input label="ساعت بسته" placeholder="21:00" {...register('workingHours.close')} />
        </div>
        <Button type="submit" size="lg" loading={loading}>ذخیره تغییرات</Button>
      </form>
    </div>
  )
}
