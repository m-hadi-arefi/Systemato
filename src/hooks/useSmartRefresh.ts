'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRealtimeContext } from '@/context/RealtimeContext'
import { getAffectedRoutes, pathMatches } from '@/lib/realtime/routeRegistry'
import type { RealtimeEvent } from '@/lib/realtime/types'

export function useSmartRefresh(refetch: () => void): void {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { subscribe } = useRealtimeContext()
  const refetchRef = useRef(refetch)

  useEffect(() => {
    refetchRef.current = refetch
  }, [refetch])

  useEffect(() => {
    const role = session?.user?.role as 'BUSINESS_OWNER' | 'CUSTOMER' | undefined
    if (!role) return

    const unsub = subscribe((events: RealtimeEvent[]) => {
      const shouldRefresh = events.some((event) => {
        const routes = getAffectedRoutes(event, role)
        return routes.some((route) => pathMatches(pathname, route))
      })
      if (shouldRefresh) refetchRef.current()
    })

    return unsub
  }, [pathname, session?.user?.role, subscribe])
}
