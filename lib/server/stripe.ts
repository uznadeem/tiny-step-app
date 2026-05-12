import Stripe from 'stripe'

export type BillingPlan = 'monthly' | 'annual'
export type ProfileStatus = 'trial' | 'active' | 'inactive'

type StripePriceConfig = {
  priceId: string
  interval: BillingPlan
}

let stripeClient: Stripe | null = null

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name}.`)
  }

  return value
}

export function createStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(requiredEnv('STRIPE_SECRET_KEY'))
  }

  return stripeClient
}

export function getStripePriceConfig(plan: BillingPlan): StripePriceConfig {
  if (plan === 'monthly') {
    return {
      priceId: requiredEnv('STRIPE_MONTHLY_PRICE_ID'),
      interval: 'monthly',
    }
  }

  return {
    priceId: requiredEnv('STRIPE_ANNUAL_PRICE_ID'),
    interval: 'annual',
  }
}

export function parseBillingPlan(value: unknown): BillingPlan | null {
  return value === 'monthly' || value === 'annual' ? value : null
}

export function getStripeWebhookSecret() {
  return requiredEnv('STRIPE_WEBHOOK_SECRET')
}

export function getAppUrl() {
  return requiredEnv('APP_URL').replace(/\/+$/, '')
}

export function getPlanIntervalFromPriceId(priceId: string | null | undefined): BillingPlan | null {
  if (!priceId) return null

  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID?.trim()) {
    return 'monthly'
  }

  if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID?.trim()) {
    return 'annual'
  }

  return null
}

export function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price.id || null
}

export function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = subscription.items.data[0]?.current_period_end

  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000).toISOString() : null
}

export function getProfileStatusFromSubscription(subscription: Stripe.Subscription): ProfileStatus {
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return 'active'
  }

  return 'inactive'
}
