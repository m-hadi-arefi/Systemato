import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/shared/Card'
import Image from 'next/image'

export default async function CustomerHomePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/signin')

  const memberships = await prisma.businessMember.findMany({
    where: { userId: session.user.id },
    include: { business: true },
  })

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">🏪</div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">هیچ بیزینسی ندارید</h1>
        <p className="text-[var(--muted-foreground)] text-sm max-w-xs">
          برای ورود به یک بیزینس، از لینک یا QR کد که صاحب بیزینس برایتان فرستاده استفاده کنید.
        </p>
      </div>
    )
  }

  if (memberships.length === 1) {
    redirect(`/customer/${memberships[0].business.storeCode}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[var(--foreground)]">بیزینس‌های شما</h1>
      <div className="space-y-3">
        {memberships.map(({ business }) => (
          <Link key={business.id} href={`/customer/${business.storeCode}`}>
            <Card className="flex items-center gap-4 cursor-pointer hover:border-[#0FB9B1] transition-colors">
              <div className="w-14 h-14 rounded-xl bg-[var(--muted)] overflow-hidden flex-shrink-0">
                {business.logoUrl
                  ? <Image src={business.logoUrl} alt={business.name} width={56} height={56} className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--foreground)] truncate">{business.name}</p>
                {business.description && (
                  <p className="text-sm text-[var(--muted-foreground)] truncate">{business.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-[var(--muted-foreground)] rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
