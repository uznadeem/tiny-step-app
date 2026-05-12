export type ProfileStatus = 'trial' | 'active' | 'inactive'
export type PlanInterval = 'monthly' | 'annual'

export type BillingProfile = {
  status: ProfileStatus | null
  plan_interval: string | null
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  stripe_status: string | null
}

export type BillingAccess = {
  allowed: boolean
  redirectTo: '/dashboard' | '/billing'
  status: ProfileStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  planInterval: PlanInterval | null
  stripeStatus: string | null
  cancelAtPeriodEnd: boolean
}

export function normalizePlanInterval(value: string | null | undefined): PlanInterval | null {
  return value === 'monthly' || value === 'annual' ? value : null
}

export function getBillingAccess(profile: BillingProfile | null | undefined, now = new Date()): BillingAccess {
  const status = profile?.status || 'inactive'
  const trialEndsAt = profile?.trial_ends_at || null
  const currentPeriodEnd = profile?.current_period_end || null
  const stripeStatus = profile?.stripe_status || null
  const trialEnds = trialEndsAt ? new Date(trialEndsAt) : null
  const periodEnds = currentPeriodEnd ? new Date(currentPeriodEnd) : null
  const hasActiveTrial = status === 'trial' && Boolean(trialEnds && trialEnds.getTime() > now.getTime())
  const hasCurrentPaidPeriod = Boolean(periodEnds && periodEnds.getTime() > now.getTime())
  const hasStripeActiveStatus = stripeStatus === 'active' || stripeStatus === 'trialing'
  const hasActiveSubscription = status === 'active' && (hasCurrentPaidPeriod || (!currentPeriodEnd && hasStripeActiveStatus))
  const allowed = hasActiveTrial || hasActiveSubscription

  return {
    allowed,
    redirectTo: allowed ? '/dashboard' : '/billing',
    status,
    trialEndsAt,
    currentPeriodEnd,
    planInterval: normalizePlanInterval(profile?.plan_interval),
    stripeStatus,
    cancelAtPeriodEnd: Boolean(profile?.cancel_at_period_end),
  }
}

export function getTrialDaysRemaining(trialEndsAt: string | null, now = new Date()) {
  if (!trialEndsAt) return 0

  const remainingMs = new Date(trialEndsAt).getTime() - now.getTime()

  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))
}

export function formatBillingDate(value: string | null) {
  if (!value) return 'Not set'

  return new Date(value).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
