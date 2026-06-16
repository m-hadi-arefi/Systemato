import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { phoneSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = z.object({ phone: phoneSchema }).safeParse(body)
    if (!parsed.success) return NextResponse.json({ role: null })

    const user = await prisma.user.findUnique({
      where: { phone: parsed.data.phone },
      select: { role: true },
    })

    return NextResponse.json({ role: user?.role ?? null })
  } catch {
    return NextResponse.json({ role: null })
  }
}
