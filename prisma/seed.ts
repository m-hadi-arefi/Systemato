import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const configs = [
    { key: 'subscription_price_toman', value: '80000' },
    { key: 'free_trial_days', value: '30' },
    { key: 'referral_signup_bonus_days', value: '90' },
    { key: 'referral_bonus_days', value: '30' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }
  console.log('Seed complete.')
}

main().finally(() => prisma.$disconnect())
