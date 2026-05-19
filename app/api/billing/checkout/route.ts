import { jsonError } from '@/lib/server/api'
import { getBillingAccess, type BillingProfile as BillingAccessProfile } from '@/lib/billing'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'
import { getAuthenticatedUser } from '@/lib/server/supabase'
import { createStripeClient, getAppUrl, getStripePriceConfig, parseBillingPlan } from '@/lib/server/stripe'

type BillingProfile = {
  id: string
  email: string | null
  display_name: string | null
  stripe_customer_id: string | null
  trial_ends_at: string | null
  status: BillingAccessProfile['status']
  plan_interval: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  stripe_status: string | null
}

export const runtime = 'nodejs'

function getFutureTrialEndTimestamp(trialEndsAt: string | null) {
  if (!trialEndsAt) return undefined

  const timestamp = Math.floor(new Date(trialEndsAt).getTime() / 1000)
  const now = Math.floor(Date.now() / 1000)

  return timestamp > now ? timestamp : undefined
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return jsonError('Unauthorized.', 401)
    }

    const body = await request.json()
    const plan = parseBillingPlan(body?.plan)

    if (!plan) {
      return jsonError('Plan must be monthly or annual.', 400)
    }

    const supabase = createSupabaseAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, display_name, stripe_customer_id, trial_ends_at, status, plan_interval, current_period_end, cancel_at_period_end, stripe_status')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    if (!profile) {
      return jsonError('Profile not found.', 404)
    }

    const billingProfile = profile as BillingProfile
    const currentAccess = getBillingAccess(billingProfile)

    if (currentAccess.allowed && currentAccess.status === 'active') {
      return jsonError('You already have an active subscription.', 409)
    }

    const stripe = createStripeClient()
    const price = getStripePriceConfig(plan)
    const appUrl = getAppUrl()
    let customerId = billingProfile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: billingProfile.email || user.email,
        name: billingProfile.display_name || user.user_metadata?.display_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customerId = customer.id

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }
    }

    const trialEnd = getFutureTrialEndTimestamp(billingProfile.trial_ends_at)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: price.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing?checkout=success`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
      client_reference_id: user.id,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_interval: price.interval,
        },
        ...(trialEnd ? { trial_end: trialEnd } : {}),
      },
      metadata: {
        supabase_user_id: user.id,
        plan_interval: price.interval,
      },
    })

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL.')
    }

    return Response.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create Checkout session.'
    const status = message.startsWith('Missing STRIPE_') || message === 'Missing APP_URL.' ? 503 : 500

    return jsonError(message, status)
  }
}
