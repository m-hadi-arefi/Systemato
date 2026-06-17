'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import toast from 'react-hot-toast'
import { formatPersianDate } from '@/lib/persian-date'
import { addDays } from 'date-fns-jalali'

interface SubscriptionData {
  freeUntil: string
  daysLeft: number
  isActive: boolean
  subscriptionPrice: number
  referralCount: number
  referralBonusDays: number
  referredByName: string | null
  payments: Array<{
    id: string
    amount: number
    months: number
    refId: string | null
    createdAt: string
    verifiedAt: string | null
  }>
}

const MONTH_OPTIONS = [1, 3, 6, 12]

function SubscriptionContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [selectedMonths, setSelectedMonths] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/business/subscription').then(r => r.json()).then(setData)
  }, [])

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const ref = searchParams.get('ref')
    if (success === '1') {
      toast.success(ref ? `پرداخت موفق — شماره تراکنش: ${ref}` : 'اشتراک با موفقیت تمدید شد')
    } else if (error === 'cancelled') {
      toast.error('پرداخت توسط شما لغو شد')
    } else if (error) {
      toast.error('خطا در پرداخت. لطفاً دوباره تلاش کنید')
    }
  }, [searchParams])

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch('/api/business/subscription/pay', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ months: selectedMonths }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'خطای ناشناخته')
      window.location.href = json.url
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا در اتصال به درگاه')
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-3xl">⏳</div>
      </div>
    )
  }

  const price = data.subscriptionPrice
  const totalPrice = price * selectedMonths
  const freeUntilDate = new Date(data.freeUntil)
  const now = new Date()
  const baseDate = freeUntilDate > now ? freeUntilDate : now
  const newExpiryDate = addDays(baseDate, selectedMonths * 30)
  const referralMonths = Math.floor((data.referralCount * data.referralBonusDays) / 30)

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold text-[var(--foreground)]">اشتراک</h1>

      {/* وضعیت اشتراک */}
      <Card className={data.isActive ? 'border-[#0FB9B1]' : 'border-red-400'}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {data.isActive ? '✅ اشتراک فعال' : '❌ اشتراک منقضی'}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {data.isActive
                ? `تا ${formatPersianDate(freeUntilDate)} — ${data.daysLeft} روز باقیمانده`
                : 'دوره اشتراک به پایان رسیده'}
            </p>
          </div>
          <div className={`text-2xl font-bold ${data.isActive ? 'text-[#0FB9B1]' : 'text-red-400'}`}>
            {data.daysLeft}
            <span className="text-xs font-normal mr-0.5">روز</span>
          </div>
        </div>
      </Card>

      {/* جوایز دعوت */}
      <Card>
        <p className="font-semibold text-[var(--foreground)] mb-3">🎁 جوایز دعوت</p>
        <div className="space-y-2 text-sm">
          {data.referredByName && (
            <div className="flex items-center justify-between bg-[var(--muted)] rounded-xl px-3 py-2">
              <span className="text-[var(--muted-foreground)]">دعوت‌کننده شما</span>
              <span className="font-medium text-[var(--foreground)]">{data.referredByName}</span>
            </div>
          )}
          <div className="flex items-center justify-between bg-[var(--muted)] rounded-xl px-3 py-2">
            <span className="text-[var(--muted-foreground)]">افراد دعوت‌شده</span>
            <span className="font-medium text-[var(--foreground)]">{data.referralCount} نفر</span>
          </div>
          <div className="flex items-center justify-between bg-[#0FB9B1]/10 rounded-xl px-3 py-2">
            <span className="text-[#0FB9B1]">ماه‌های جایزه دریافتی</span>
            <span className="font-bold text-[#0FB9B1]">{referralMonths} ماه</span>
          </div>
        </div>
      </Card>

      {/* خرید اشتراک */}
      <Card>
        <p className="font-semibold text-[var(--foreground)] mb-4">💳 خرید اشتراک</p>

        <div className="flex gap-2 mb-4">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonths(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedMonths === m
                  ? 'bg-[#0FB9B1] text-white border-[#0FB9B1]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#0FB9B1]'
              }`}
            >
              {m} ماه
            </button>
          ))}
        </div>

        <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2 mb-4 text-sm">
          <div className="flex justify-between text-[var(--muted-foreground)]">
            <span>قیمت هر ماه</span>
            <span>{price.toLocaleString('fa-IR')} تومان</span>
          </div>
          <div className="flex justify-between font-bold text-[var(--foreground)] text-base border-t border-[var(--border)] pt-2">
            <span>مجموع</span>
            <span>{totalPrice.toLocaleString('fa-IR')} تومان</span>
          </div>
          <div className="border-t border-[var(--border)] pt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
            <p>
              📅 با خرید این اشتراک،{' '}
              <span className="font-semibold text-[var(--foreground)]">
                {selectedMonths} ماه ({selectedMonths * 30} روز)
              </span>{' '}
              به اعتبار شما اضافه می‌شود
            </p>
            <p>
              📆 تاریخ انقضای جدید:{' '}
              <span className="font-semibold text-[var(--foreground)]">
                {formatPersianDate(newExpiryDate)}
              </span>
            </p>
          </div>
        </div>

        <Button size="lg" loading={loading} onClick={handlePay}>
          پرداخت از طریق زرین‌پال
        </Button>
      </Card>

      {/* تاریخچه پرداخت‌ها */}
      {data.payments.length > 0 && (
        <Card>
          <p className="font-semibold text-[var(--foreground)] mb-3">📋 تاریخچه پرداخت‌ها</p>
          <div className="space-y-2">
            {data.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm border-b border-[var(--border)] last:border-0 pb-2 last:pb-0"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {p.months} ماه — {p.amount.toLocaleString('fa-IR')} تومان
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {p.verifiedAt ? formatPersianDate(p.verifiedAt) : formatPersianDate(p.createdAt)}
                    {p.refId && ` — کد پیگیری: ${p.refId}`}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">موفق</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin text-3xl">⏳</div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  )
}
