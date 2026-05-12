import { jsonError } from '@/lib/server/api'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'
import { getAuthenticatedUser } from '@/lib/server/supabase'
import { createStripeClient, getAppUrl } from '@/lib/server/stripe'

type BillingProfile = {
  stripe_customer_id: string | null
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return jsonError('Unauthorized.', 401)
    }

    const supabase = createSupabaseAdminClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    const billingProfile = profile as BillingProfile | null

    if (!billingProfile?.stripe_customer_id) {
      return jsonError('No Stripe customer found for this account.', 404)
    }

    const stripe = createStripeClient()
    const appUrl = getAppUrl()
    const session = await stripe.billingPortal.sessions.create({
      customer: billingProfile.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    })

    return Response.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to open billing portal.'
    const status = message.startsWith('Missing STRIPE_') || message === 'Missing APP_URL.' ? 503 : 500

    return jsonError(message, status)
  }
}
