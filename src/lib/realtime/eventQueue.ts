import type { RealtimeEvent } from './types'

export type BatchHandler = (events: RealtimeEvent[]) => void

interface EventQueueOptions {
  debounceMs?: number
  maxOfflineSize?: number
}

function dedupKey(event: RealtimeEvent): string {
  const p = event.payload as unknown as Record<string, unknown>
  const id =
    (p.appointmentId as string | undefined) ??
    (p.serviceId as string | undefined) ??
    (p.memberId as string | undefined) ??
    (p.paymentId as string | undefined) ??
    (p.businessId as string | undefined) ??
    'unknown'
  return `${event.type}:${id}`
}

export class EventQueue {
  private pending = new Map<string, RealtimeEvent>()
  private offline: RealtimeEvent[] = []
  private online = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private handler: BatchHandler
  private debounceMs: number
  private maxOfflineSize: number

  constructor(handler: BatchHandler, opts: EventQueueOptions = {}) {
    this.handler = handler
    this.debounceMs = opts.debounceMs ?? 300
    this.maxOfflineSize = opts.maxOfflineSize ?? 100
  }

  setOnline(): void {
    this.online = true
    // Replay buffered events
    const buffered = this.offline.splice(0)
    for (const e of buffered) this.enqueue(e)
  }

  setOffline(): void {
    this.online = false
  }

  enqueue(event: RealtimeEvent): void {
    if (!this.online) {
      if (this.offline.length < this.maxOfflineSize) {
        this.offline.push(event)
      }
      return
    }
    // Last event for same entity wins within debounce window
    this.pending.set(dedupKey(event), event)

    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const batch = Array.from(this.pending.values())
      this.pending.clear()
      this.timer = null
      if (batch.length > 0) this.handler(batch)
    }, this.debounceMs)
  }

  destroy(): void {
    if (this.timer) clearTimeout(this.timer)
    this.pending.clear()
    this.offline = []
    this.timer = null
  }
}
