'use client'

import { useEffect, useState } from 'react'
import { useRealtimeContext } from '@/context/RealtimeContext'
import type { WsStatus } from '@/lib/realtime/wsClient'

export function RealtimeStatus() {
  const { status } = useRealtimeContext()
  // Only show the indicator when not in a stable connected state
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'connected') {
      // Hide after 2 seconds of being connected
      const t = setTimeout(() => setVisible(false), 2000)
      setVisible(true)
      return () => clearTimeout(t)
    }
    setVisible(status !== 'disconnected')
  }, [status])

  if (!visible) return null

  return <StatusBadge status={status} />
}

function StatusBadge({ status }: { status: WsStatus }) {
  const config: Record<WsStatus, { dot: string; text: string; bg: string }> = {
    connected: {
      dot: 'bg-green-500 animate-pulse',
      text: 'متصل',
      bg: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    connecting: {
      dot: 'bg-amber-500 animate-ping',
      text: 'در حال اتصال...',
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    disconnected: {
      dot: 'bg-gray-400 animate-pulse',
      text: 'اتصال قطع شد',
      bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    },
    error: {
      dot: 'bg-red-500',
      text: 'خطای اتصال',
      bg: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
  }

  const c = config[status]

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg}`}
      title={`وضعیت اتصال ریل‌تایم: ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      <span>{c.text}</span>
    </div>
  )
}
