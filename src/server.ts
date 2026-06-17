import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'
import { getToken } from 'next-auth/jwt'
import type { IncomingMessage } from 'http'
import { eventBus } from './lib/realtime/eventBus'
import { wsManager } from './lib/realtime/wsManager'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000', 10)

async function validateSession(req: IncomingMessage): Promise<string | null> {
  try {
    const token = await getToken({
      req: req as Parameters<typeof getToken>[0]['req'],
      secret: process.env.NEXTAUTH_SECRET!,
    })
    return (token?.id as string | undefined) ?? null
  } catch {
    return null
  }
}

async function main() {
  const app = next({ dev, hostname: '0.0.0.0', port })
  const handle = app.getRequestHandler()

  await app.prepare()

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '/', true)
    handle(req, res, parsedUrl)
  })

  const wss = new WebSocketServer({ noServer: true })

  httpServer.on('upgrade', async (req, socket, head) => {
    const { pathname } = parse(req.url ?? '/', true)

    if (pathname !== '/api/ws') {
      socket.destroy()
      return
    }

    const userId = await validateSession(req)
    if (!userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nContent-Length: 0\r\n\r\n')
      socket.destroy()
      return
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, userId)
    })
  })

  wss.on('connection', (ws, userId: string) => {
    wsManager.register(ws, userId)
  })

  // Wire the event bus to the WebSocket manager
  eventBus.onEvent((event) => {
    wsManager.dispatch(event)
  })

  // Server-side heartbeat: ping all sockets every 30s, kill unresponsive ones
  const heartbeatInterval = setInterval(
    () => wsManager.heartbeat(),
    parseInt(process.env.WS_HEARTBEAT_MS ?? '30000', 10)
  )
  httpServer.on('close', () => clearInterval(heartbeatInterval))

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port} [${dev ? 'dev' : 'prod'}]`)
    console.log(`> WebSocket endpoint: ws://0.0.0.0:${port}/api/ws`)
  })
}

main().catch((err) => {
  console.error('Server startup error:', err)
  process.exit(1)
})
