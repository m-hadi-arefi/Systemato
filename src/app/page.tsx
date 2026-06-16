import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingPage from './landing/LandingPage'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    if (session.user.role === 'BUSINESS_OWNER') redirect('/business/dashboard')
    redirect('/customer')
  }

  return <LandingPage />
}
