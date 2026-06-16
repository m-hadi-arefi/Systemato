'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ReferralData {
  referralCode: string
  storeCode: string
  referralCount: number
  freeUntil: string
  isActive: boolean
  subscriptionPrice: number
}

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/business/referral').then(r => r.json()).then(setData)
  }, [])

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('کد کپی شد')
  }

  if (!data) return null

  const freeUntilDate = new Date(data.freeUntil)
  const daysLeft = Math.max(0, Math.ceil((freeUntilDate.getTime() - Date.now()) / 86400000))
  const signupUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${data.referralCode}`
    : `/signup?ref=${data.referralCode}`

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold text-[var(--foreground)]">رفرال و اشتراک</h1>

      {/* Subscription Status */}
      <Card className={data.isActive ? 'border-[#0FB9B1]' : 'border-red-400'}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[var(--foreground)]">
              {data.isActive ? '✅ اشتراک فعال' : '❌ اشتراک منقضی'}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {data.isActive
                ? `تا ${freeUntilDate.toLocaleDateString('fa-IR')} (${daysLeft} روز دیگر)`
                : 'دوره رایگان به پایان رسیده'}
            </p>
          </div>
          {!data.isActive && (
            <Link href="/business/subscription">
              <Button size="sm" variant="accent">تمدید</Button>
            </Link>
          )}
        </div>
        {data.isActive && (
          <div className="mt-3 bg-[#0FB9B1]/10 rounded-lg px-3 py-2">
            <p className="text-xs text-[#0FB9B1]">
              بعد از دوره رایگان: {data.subscriptionPrice.toLocaleString('fa-IR')} تومان/ماه
            </p>
          </div>
        )}
      </Card>

      {/* Referral Stats */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-[var(--foreground)]">دعوت بیزینس‌های دیگر</p>
          <div className="bg-[#0FB9B1] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {data.referralCount}
          </div>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          هر بیزینس که با کد شما ثبت‌نام کند، ۱ ماه رایگان به اشتراک شما اضافه می‌شود.
        </p>
        <div className="bg-[var(--muted)] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="font-mono text-sm text-[var(--foreground)]">{data.referralCode}</span>
          <button onClick={() => copy(data.referralCode)} className="text-[#0FB9B1] text-sm font-medium">
            {copied ? '✅' : 'کپی'}
          </button>
        </div>
        <Button variant="outline" onClick={() => copy(signupUrl)} className="w-full mt-3">
          🔗 کپی لینک دعوت بیزینس
        </Button>
      </Card>

      <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] space-y-1">
        <p>🎁 بیزینس جدید با کد شما: ۳ ماه رایگان</p>
        <p>✨ شما به ازای هر دعوت: +۱ ماه رایگان</p>
      </div>
    </div>
  )
}
