import { prisma } from './prisma'

export async function getConfig(key: string, fallback: string = ''): Promise<string> {
  const config = await prisma.systemConfig.findUnique({ where: { key } })
  return config?.value ?? fallback
}

export async function getSubscriptionPrice(): Promise<number> {
  const val = await getConfig('subscription_price_toman', '80000')
  return parseInt(val)
}

export async function getTrialDays(): Promise<number> {
  const val = await getConfig('free_trial_days', '30')
  return parseInt(val)
}

export async function getReferralSignupBonus(): Promise<number> {
  const val = await getConfig('referral_signup_bonus_days', '90')
  return parseInt(val)
}

export async function getReferralBonus(): Promise<number> {
  const val = await getConfig('referral_bonus_days', '30')
  return parseInt(val)
}
