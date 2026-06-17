'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useSmartRefresh } from '@/hooks/useSmartRefresh'

// Zero-JSX client component for Server Component pages.
// Drop <RouteRefresher /> into any server-rendered page to get smart realtime refresh.
export function RouteRefresher() {
  const router = useRouter()
  const refresh = useCallback(() => router.refresh(), [router])
  useSmartRefresh(refresh)
  return null
}
