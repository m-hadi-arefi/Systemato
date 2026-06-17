import { NextResponse } from 'next/server'
import { wsManager } from '@/lib/realtime/wsManager'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    connections: wsManager.connectionCount(),
  })
}
