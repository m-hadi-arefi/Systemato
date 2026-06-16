import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { businessProfileSchema } from '@/lib/validations/business'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { ownerId: session.user.id } })
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(business)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = businessProfileSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  const business = await prisma.business.update({
    where: { ownerId: session.user.id },
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      phone: parsed.data.phone || null,
      description: parsed.data.description,
      workingHours: parsed.data.workingHours as object,
      primaryColor: parsed.data.primaryColor || null,
      secondaryColor: parsed.data.secondaryColor || null,
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
    },
  })

  return NextResponse.json(business)
}
