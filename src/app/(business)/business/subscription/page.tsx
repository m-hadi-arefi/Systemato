import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionPrice } from '@/lib/config'
import { redirect } from 'next/navigation'
import { Card } from '@/components/shared/Card'

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/signin')

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) redirect('/business/onboarding')

  const price = await getSubscriptionPrice()

  return (
    <div className="max-w-sm mx-auto space-y-6 pt-8">
      <div className="text-center">
        <div className="text-5xl mb-3">💳</div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">تمدید اشتراک</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-2">برای ادامه استفاده از سیستماتو</p>
      </div>

      <Card className="text-center">
        <div className="text-4xl font-bold text-[#0FB9B1]">
          {price.toLocaleString('fa-IR')}
        </div>
        <div className="text-[var(--muted-foreground)] text-sm mt-1">تومان / ماه</div>
      </Card>

      <div className="space-y-3 text-sm text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2"><span className="text-[#0FB9B1]">✓</span> مدیریت نامحدود مشتری</div>
        <div className="flex items-center gap-2"><span className="text-[#0FB9B1]">✓</span> سیستم نوبت‌دهی کامل</div>
        <div className="flex items-center gap-2"><span className="text-[#0FB9B1]">✓</span> SMS نوتیفیکیشن</div>
        <div className="flex items-center gap-2"><span className="text-[#0FB9B1]">✓</span> QR کد اختصاصی</div>
      </div>

      <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--muted-foreground)] text-center">
        برای پرداخت با پشتیبانی تماس بگیرید
      </div>
    </div>
  )
}
