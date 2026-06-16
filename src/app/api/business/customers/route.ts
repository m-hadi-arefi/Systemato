import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addCustomerSchema } from '@/lib/validations/business'

async function getBusiness(ownerId: string) {
  return prisma.business.findUnique({ where: { ownerId } })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  const members = await prisma.businessMember.findMany({
    where: {
      businessId: business.id,
      ...(q && {
        OR: [
          { displayName: { contains: q, mode: 'insensitive' } },
          { user: { OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ]}},
        ],
      }),
    },
    include: { user: true },
    orderBy: { joinedAt: 'desc' },
  })

  return NextResponse.json(
    members.map((m) => ({
      id: m.user.id,
      phone: m.user.phone,
      name: m.displayName || m.user.name,
      globalName: m.user.name,
      displayName: m.displayName,
      joinedAt: m.joinedAt,
      memberId: m.id,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'BUSINESS_OWNER')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const business = await getBusiness(session.user.id)
  if (!business) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const parsed = addCustomerSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })

  // Global user identity: search by phone first
  let user = await prisma.user.findUnique({ where: { phone: parsed.data.phone } })

  if (!user) {
    // Create new user only if phone doesn't exist
    user = await prisma.user.create({
      data: { phone: parsed.data.phone, name: parsed.data.name, role: 'CUSTOMER' },
    })
  }

  // Check that user is not a business owner
  if (user.role === 'BUSINESS_OWNER') {
    return NextResponse.json(
      { error: 'این شماره متعلق به یک صاحب بیزینس است و نمی‌تواند مشتری باشد' },
      { status: 400 }
    )
  }

  // Upsert BusinessMember — update displayName if provided
  await prisma.businessMember.upsert({
    where: { userId_businessId: { userId: user.id, businessId: business.id } },
    update: { ...(parsed.data.name && { displayName: parsed.data.name }) },
    create: {
      userId: user.id,
      businessId: business.id,
      displayName: parsed.data.name || null,
    },
  })

  return NextResponse.json({ success: true, customer: user })
}
