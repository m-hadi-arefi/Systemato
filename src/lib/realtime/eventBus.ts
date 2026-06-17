import { EventEmitter } from 'events'
import type { RealtimeEvent } from './types'

export interface EventBusAdapter {
  publish(event: RealtimeEvent): Promise<void>
  subscribe(handler: (event: RealtimeEvent) => void): void
  close(): Promise<void>
}

class InMemoryAdapter implements EventBusAdapter {
  private emitter = new EventEmitter()

  constructor() {
    this.emitter.setMaxListeners(500)
  }

  async publish(event: RealtimeEvent): Promise<void> {
    this.emitter.emit('rt:event', event)
  }

  subscribe(handler: (event: RealtimeEvent) => void): void {
    this.emitter.on('rt:event', handler)
  }

  async close(): Promise<void> {
    this.emitter.removeAllListeners()
  }
}

class EventBus {
  private adapter: EventBusAdapter

  constructor(adapter: EventBusAdapter) {
    this.adapter = adapter
  }

  emit(event: RealtimeEvent): void {
    this.adapter.publish(event).catch((err) =>
      console.error('[EventBus] publish error:', err)
    )
  }

  onEvent(handler: (event: RealtimeEvent) => void): void {
    this.adapter.subscribe(handler)
  }

  swapAdapter(adapter: EventBusAdapter): void {
    this.adapter.close().catch(console.error)
    this.adapter = adapter
  }
}

// globalThis singleton survives Next.js hot-reload and bridges
// the custom server process and Next.js API route modules.
const g = globalThis as typeof globalThis & { __eventBus?: EventBus }
export const eventBus: EventBus =
  g.__eventBus ?? (g.__eventBus = new EventBus(new InMemoryAdapter()))
