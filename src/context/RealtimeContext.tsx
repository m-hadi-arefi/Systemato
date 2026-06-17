'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { wsClient, type WsStatus } from '@/lib/realtime/wsClient'
import { EventQueue, type BatchHandler } from '@/lib/realtime/eventQueue'
import type { RealtimeEvent } from '@/lib/realtime/types'

interface RealtimeContextValue {
  status: WsStatus
  subscribe: (handler: BatchHandler) => () => void
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession()
  const [status, setStatus] = useState<WsStatus>('disconnected')
  const router = useRouter()

  const handlersRef = useRef<Set<BatchHandler>>(new Set())
  const queueRef = useRef<EventQueue | null>(null)

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) return

    const queue = new EventQueue(
      (events: RealtimeEvent[]) => {
        for (const h of handlersRef.current) h(events)
      },
      { debounceMs: 300, maxOfflineSize: 100 }
    )
    queueRef.current = queue

    const offEvent = wsClient.onEvent((event) => queue.enqueue(event))

    const offStatus = wsClient.onStatus((s) => {
      setStatus(s)
      if (s === 'connected') queue.setOnline()
      else queue.setOffline()
    })

    // On reconnect: do a full router.refresh() to catch up on missed events
    const offReconnect = wsClient.onReconnect(() => {
      queue.setOnline()
      router.refresh()
    })

    wsClient.connect()
    setStatus(wsClient.getStatus())

    return () => {
      offEvent()
      offStatus()
      offReconnect()
      queue.destroy()
      queueRef.current = null
      wsClient.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, sessionStatus])

  const subscribe = useCallback((handler: BatchHandler): (() => void) => {
    handlersRef.current.add(handler)
    return () => handlersRef.current.delete(handler)
  }, [])

  return (
    <RealtimeContext.Provider value={{ status, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext)
  if (!ctx) throw new Error('useRealtimeContext must be used inside RealtimeProvider')
  return ctx
}
