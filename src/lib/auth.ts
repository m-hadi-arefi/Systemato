import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { addDays } from 'date-fns'
import { generateStoreCode } from './utils'
import { getReferralSignupBonus, getTrialDays } from './config'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'OTP',
      credentials: {
        phone: { type: 'text' },
        code: { type: 'text' },
        referralCode: { type: 'text' },
        storeCode: { type: 'text' },
        role: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null

        const otp = await prisma.otpCode.findFirst({
          where: {
            phone: credentials.phone,
            code: credentials.code,
            used: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        })
        if (!otp) return null

        await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

        let user = await prisma.user.findUnique({ where: { phone: credentials.phone } })

        if (!user) {
          const role = credentials.role === 'BUSINESS_OWNER' ? 'BUSINESS_OWNER' : 'CUSTOMER'
          user = await prisma.user.create({ data: { phone: credentials.phone, role } })
        } else {
          // Existing user: if they try to register as BUSINESS_OWNER but are CUSTOMER, block
          if (credentials.role === 'BUSINESS_OWNER' && user.role === 'CUSTOMER') {
            return null
          }
        }

        // اگر مشتری با storeCode وارد شده، اضافه کن به بیزینس
        if (credentials.storeCode && user.role === 'CUSTOMER') {
          const business = await prisma.business.findUnique({
            where: { storeCode: credentials.storeCode },
          })
          if (business) {
            await prisma.businessMember.upsert({
              where: { userId_businessId: { userId: user.id, businessId: business.id } },
              update: {},
              create: { userId: user.id, businessId: business.id },
            })
          }
        }

        // اگر بیزینس جدید و referralCode داده شده، ثبت کن
        if (credentials.referralCode && user.role === 'BUSINESS_OWNER') {
          const existing = await prisma.business.findUnique({ where: { ownerId: user.id } })
          if (!existing) {
            const referrer = await prisma.business.findUnique({
              where: { referralCode: credentials.referralCode },
            })
            if (referrer) {
              const bonus = await import('./config').then((m) => m.getReferralBonus())
              await prisma.business.update({
                where: { id: referrer.id },
                data: { freeUntil: addDays(referrer.freeUntil, bonus) },
              })
            }
          }
        }

        // ساخت بیزینس اگر صاحب بیزینس و هنوز بیزینسی ندارد
        if (user.role === 'BUSINESS_OWNER') {
          const existing = await prisma.business.findUnique({ where: { ownerId: user.id } })
          if (!existing) {
            const hasReferral = !!credentials.referralCode
            const bonusDays = hasReferral
              ? await getReferralSignupBonus()
              : await getTrialDays()
            await prisma.business.create({
              data: {
                name: '',
                ownerId: user.id,
                storeCode: generateStoreCode(6),
                referralCode: generateStoreCode(8),
                referredBy: credentials.referralCode || null,
                freeUntil: addDays(new Date(), bonusDays),
              },
            })
          }
        }

        return { id: user.id, phone: user.phone, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as unknown as { phone: string }).phone
        token.role = (user as unknown as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
