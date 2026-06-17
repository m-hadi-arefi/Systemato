import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { formatPersianTime } from '@/lib/persian-date'

// این route با Vercel Cron هر شب اجرا می‌شود
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const tomorrow = addDays(new Date(), 1)
  const appointments = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      datetime: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
    },
    include: {
      customer: { select: { phone: true } },
      business: { select: { name: true } },
    },
  })

  const results = await Promise.allSettled(
    appointments.map((a) => {
      const dt = formatPersianTime(a.datetime)
      return sendSms(
        a.customer.phone,
        `یادآوری: نوبت شما فردا ساعت ${dt} در ${a.business.name}`
      )
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: appointments.length })
}
