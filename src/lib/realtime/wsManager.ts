import type { WebSocket } from 'ws'
import type { RealtimeEvent } from './types'
import { getAffectedUserIds } from './types'

interface AuthenticatedSocket extends WebSocket {
  userId: string
  isAlive: boolean
}

class WsManager {
  // userId → Set of open sockets (multiple tabs per user)
  private rooms = new Map<string, Set<AuthenticatedSocket>>()

  register(ws: WebSocket, userId: string): void {
    const socket = ws as AuthenticatedSocket
    socket.userId = userId
    socket.isAlive = true

    const room = this.rooms.get(userId) ?? new Set<AuthenticatedSocket>()
    room.add(socket)
    this.rooms.set(userId, room)

    // Confirm connection to client
    this.send(socket, { type: 'connected', userId })

    // Reply to application-level pings
    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg?.type === 'ping') {
          this.send(socket, { type: 'pong' })
        }
      } catch {
        // ignore malformed messages
      }
    })

    // WS-protocol pong (response to server-initiated ws.ping())
    socket.on('pong', () => {
      socket.isAlive = true
    })

    socket.on('close', () => {
      this.remove(socket)
    })

    socket.on('error', (err) => {
      console.error(`[WsManager] socket error user=${userId}:`, err.message)
      this.remove(socket)
    })
  }

  remove(socket: AuthenticatedSocket): void {
    const room = this.rooms.get(socket.userId)
    if (!room) return
    room.delete(socket)
    if (room.size === 0) this.rooms.delete(socket.userId)
  }

  dispatch(event: RealtimeEvent): void {
    const userIds = getAffectedUserIds(event)
    const message = JSON.stringify({ ...event, timestamp: Date.now() })
    for (const userId of userIds) {
      const room = this.rooms.get(userId)
      if (!room) continue
      for (const socket of room) {
        if (socket.readyState === 1 /* OPEN */) {
          socket.send(message)
        } else {
          room.delete(socket)
        }
      }
      if (room.size === 0) this.rooms.delete(userId)
    }
  }

  // Called on a 30s interval to kill stale connections
  heartbeat(): void {
    for (const [userId, room] of this.rooms) {
      for (const socket of room) {
        if (!socket.isAlive) {
          socket.terminate()
          room.delete(socket)
        } else {
          socket.isAlive = false
          socket.ping()
        }
      }
      if (room.size === 0) this.rooms.delete(userId)
    }
  }

  connectionCount(): number {
    let n = 0
    for (const room of this.rooms.values()) n += room.size
    return n
  }

  private send(socket: AuthenticatedSocket, data: object): void {
    if (socket.readyState === 1 /* OPEN */) {
      socket.send(JSON.stringify(data))
    }
  }
}

const g = globalThis as typeof globalThis & { __wsManager?: WsManager }
export const wsManager: WsManager =
  g.__wsManager ?? (g.__wsManager = new WsManager())
