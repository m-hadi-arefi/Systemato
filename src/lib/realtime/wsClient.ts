import type { RealtimeEvent, WsClientMessage } from './types'

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

type EventHandler = (event: RealtimeEvent) => void
type StatusHandler = (status: WsStatus) => void
type ReconnectHandler = () => void

const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30_000
const PING_INTERVAL_MS = 25_000
const PONG_TIMEOUT_MS = 5_000

function jitter(): number {
  return Math.random() * 500
}

class RealtimeWsClient {
  private ws: WebSocket | null = null
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private pongTimer: ReturnType<typeof setTimeout> | null = null
  private destroyed = false

  private eventHandlers = new Set<EventHandler>()
  private statusHandlers = new Set<StatusHandler>()
  private reconnectHandlers = new Set<ReconnectHandler>()

  private _status: WsStatus = 'disconnected'

  connect(): void {
    if (this.destroyed) return
    if (typeof window === 'undefined') return

    this.setStatus('connecting')

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${protocol}://${window.location.host}/api/ws`
    const isReconnect = this.retries > 0

    try {
      const ws = new WebSocket(url)
      this.ws = ws

      ws.onopen = () => {
        this.retries = 0
        this.setStatus('connected')
        if (isReconnect) {
          for (const h of this.reconnectHandlers) h()
        }
        this.startPing()
      }

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data as string) as { type: string }
          if (data.type === 'connected' || data.type === 'pong') {
            if (data.type === 'pong') this.clearPongTimer()
            return
          }
          for (const h of this.eventHandlers) h(data as RealtimeEvent)
        } catch {
          // ignore malformed
        }
      }

      ws.onclose = () => {
        this.stopPing()
        if (this.destroyed) return
        this.setStatus('disconnected')
        this.scheduleReconnect()
      }

      ws.onerror = () => {
        this.setStatus('error')
        // onclose fires after onerror — reconnect is handled there
      }
    } catch {
      this.setStatus('error')
      this.scheduleReconnect()
    }
  }

  disconnect(): void {
    this.destroyed = true
    this.stopPing()
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.ws?.close()
    this.ws = null
    this.setStatus('disconnected')
  }

  onEvent(handler: EventHandler): () => void {
    this.eventHandlers.add(handler)
    return () => this.eventHandlers.delete(handler)
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  onReconnect(handler: ReconnectHandler): () => void {
    this.reconnectHandlers.add(handler)
    return () => this.reconnectHandlers.delete(handler)
  }

  getStatus(): WsStatus {
    return this._status
  }

  private setStatus(s: WsStatus): void {
    this._status = s
    for (const h of this.statusHandlers) h(s)
  }

  private scheduleReconnect(): void {
    if (this.destroyed) return
    const delay = Math.min(BASE_DELAY_MS * Math.pow(2, this.retries), MAX_DELAY_MS) + jitter()
    this.retries++
    this.retryTimer = setTimeout(() => this.connect(), delay)
  }

  private startPing(): void {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const msg: WsClientMessage = { type: 'ping' }
        this.ws.send(JSON.stringify(msg))
        // Expect pong within 5s or assume dead connection
        this.pongTimer = setTimeout(() => {
          this.ws?.close()
        }, PONG_TIMEOUT_MS)
      }
    }, PING_INTERVAL_MS)
  }

  private stopPing(): void {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null }
    this.clearPongTimer()
  }

  private clearPongTimer(): void {
    if (this.pongTimer) { clearTimeout(this.pongTimer); this.pongTimer = null }
  }
}

// Module-level singleton — one connection per browser tab
export const wsClient = new RealtimeWsClient()
