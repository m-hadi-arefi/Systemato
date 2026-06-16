'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessProfileSchema, type BusinessProfileInput, type WorkingHours } from '@/lib/validations/business'
import { Input } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { WorkingHoursPicker } from '@/components/business/WorkingHoursPicker'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(
  () => import('@/components/business/MapPicker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-xl bg-[var(--muted)] animate-pulse" /> }
)

const SECTIONS = ['invite', 'basic', 'location', 'hours', 'branding'] as const
type Section = typeof SECTIONS[number]

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [storeCode, setStoreCode] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [openSection, setOpenSection] = useState<Section>('basic')

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<BusinessProfileInput & { latitude?: number; longitude?: number }>({
    resolver: zodResolver(businessProfileSchema),
  })

  useEffect(() => {
    fetch('/api/business/profile').then(r => r.json()).then(data => {
      reset({
        name: data.name,
        address: data.address || '',
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        phone: data.phone || '',
        description: data.description || '',
        workingHours: data.workingHours || {},
        primaryColor: data.primaryColor || '',
        secondaryColor: data.secondaryColor || '',
      })
      setStoreCode(data.storeCode)
      setLogoUrl(data.logoUrl || '')
      setCoverImageUrl(data.coverImageUrl || '')
    })
  }, [reset])

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?store_code=${storeCode}`
    : `/signup?store_code=${storeCode}`

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) {
      if (type === 'logo') { setLogoUrl(json.url); toast.success('لوگو آپلود شد') }
      else { setCoverImageUrl(json.url); toast.success('کاور آپلود شد') }
    } else toast.error(json.error)
  }

  async function onSubmit(data: BusinessProfileInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logoUrl, coverImageUrl }),
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

  function SectionHeader({ id, title, icon }: { id: Section; title: string; icon: React.ReactNode }) {
    const isOpen = openSection === id
    return (
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-right"
        onClick={() => setOpenSection(isOpen ? 'basic' : id)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
            {icon}
          </div>
          <span className="font-semibold text-[var(--foreground)]">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">پروفایل بیزینس</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">اطلاعات و تنظیمات کسب‌وکار خود را مدیریت کنید</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Invite Code */}
        {storeCode && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <SectionHeader
              id="invite"
              title="کد دعوت مشتریان"
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
            />
            {openSection === 'invite' && (
              <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)] pt-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-2xl shadow-sm flex-shrink-0">
                    <QRCodeSVG value={inviteUrl} size={140} fgColor="#0F172A" />
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <p className="text-sm text-[var(--muted-foreground)]">این لینک را با مشتریان خود به اشتراک بگذارید:</p>
                    <div className="bg-[var(--muted)] rounded-xl px-4 py-3 text-xs font-mono break-all" dir="ltr">
                      {inviteUrl}
                    </div>
                    <Button type="button" variant="outline" onClick={copyLink} className="w-full">
                      {copied
                        ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> کپی شد</>
                        : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> کپی لینک دعوت</>
                      }
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <SectionHeader
            id="basic"
            title="اطلاعات اصلی"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />
          {openSection === 'basic' && (
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)] pt-4">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] overflow-hidden border border-[var(--border)] flex-shrink-0">
                  {logoUrl
                    ? <img src={logoUrl} alt="لوگو" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>}
                </div>
                <label className="cursor-pointer">
                  <span className="text-sm text-[var(--primary)] font-medium hover:underline">تغییر لوگو</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                </label>
              </div>

              <Input label="نام بیزینس *" {...register('name')} error={errors.name?.message} />
              <Input label="شماره تماس" type="tel" dir="ltr" {...register('phone')} error={errors.phone?.message} />
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-1.5">توضیح</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="توضیح مختصر درباره کسب‌وکار خود..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none placeholder:text-[var(--muted-foreground)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <SectionHeader
            id="location"
            title="موقعیت مکانی"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          {openSection === 'location' && (
            <div className="px-5 pb-5 border-t border-[var(--border)] pt-4">
              <Controller
                control={control}
                name="address"
                render={() => (
                  <MapPicker
                    lat={watch('latitude')}
                    lng={watch('longitude')}
                    address={watch('address')}
                    onChange={(lat, lng, addr) => {
                      setValue('latitude', lat)
                      setValue('longitude', lng)
                      setValue('address', addr)
                    }}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <SectionHeader
            id="hours"
            title="ساعات کاری"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          {openSection === 'hours' && (
            <div className="px-5 pb-5 border-t border-[var(--border)] pt-4">
              <Controller
                control={control}
                name="workingHours"
                render={({ field }) => (
                  <WorkingHoursPicker
                    value={field.value as WorkingHours}
                    onChange={(v) => field.onChange(v)}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <SectionHeader
            id="branding"
            title="برندینگ و تم"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
          />
          {openSection === 'branding' && (
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border)] pt-4">
              <p className="text-sm text-[var(--muted-foreground)]">رنگ‌های اصلی برند را انتخاب کنید — مشتریان این رنگ را در صفحات شما می‌بینند</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)] block mb-2">رنگ اصلی</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register('primaryColor')}
                      className="w-10 h-10 rounded-xl border border-[var(--border)] cursor-pointer p-1 bg-[var(--card)]"
                    />
                    <Input
                      {...register('primaryColor')}
                      placeholder="#0FB9B1"
                      className="text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)] block mb-2">رنگ ثانویه</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      {...register('secondaryColor')}
                      className="w-10 h-10 rounded-xl border border-[var(--border)] cursor-pointer p-1 bg-[var(--card)]"
                    />
                    <Input
                      {...register('secondaryColor')}
                      placeholder="#F79621"
                      className="text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] block mb-2">تصویر کاور</label>
                <div className="w-full h-32 rounded-xl bg-[var(--muted)] overflow-hidden border border-[var(--border)] relative">
                  {coverImageUrl
                    ? <img src={coverImageUrl} alt="کاور" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">بدون تصویر کاور</div>}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                    <span className="text-transparent hover:text-white text-sm font-medium">تغییر کاور</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading}>ذخیره تغییرات</Button>
      </form>
    </div>
  )
}
