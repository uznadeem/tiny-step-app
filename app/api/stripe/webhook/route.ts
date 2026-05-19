import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'
import {
  createStripeClient,
  getPlanIntervalFromPriceId,
  getProfileStatusFromSubscription,
  getStripeWebhookSecret,
  getSubscriptionCurrentPeriodEnd,
  getSubscriptionPriceId,
} from '@/lib/server/stripe'

export const runtime = 'nodejs'

function getSubscriptionUserId(subscription: Stripe.Subscription) {
  return subscription.metadata.supabase_user_id || null
}

async function updateProfileFromSubscription(subscription: Stripe.Subscription, fallbackUserId?: string | null) {
  const userId = getSubscriptionUserId(subscription) || fallbackUserId || null
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  if (!userId && !customerId) {
    console.warn('Stripe subscription missing user and customer identifiers.', { subscriptionId: subscription.id })
    return
  }

  const priceId = getSubscriptionPriceId(subscription)
  const planInterval = getPlanIntervalFromPriceId(priceId)
  const supabase = createSupabaseAdminClient()
  const update = {
    status: getProfileStatusFromSubscription(subscription),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan_interval: planInterval,
    current_period_end: getSubscriptionCurrentPeriodEnd(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end,
    stripe_status: subscription.status,
  }

  const query = supabase
    .from('profiles')
    .update(update)

  const { error } = userId
    ? await query.eq('id', userId)
    : await query.eq('stripe_customer_id', customerId)

  if (error) {
    throw error
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (typeof session.subscription !== 'string') {
    return
  }

  const stripe = createStripeClient()
  const subscription = await stripe.subscriptions.retrieve(session.subscription)
  const fallbackUserId = session.client_reference_id || session.metadata?.supabase_user_id || null

  await updateProfileFromSubscription(subscription, fallbackUserId)
}

async function handleInvoiceEvent(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
    ? invoice.parent.subscription_details.subscription
    : null

  if (!subscriptionId) {
    return
  }

  const stripe = createStripeClient()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  await updateProfileFromSubscription(subscription)
}

export async function POST(request: Request) {
  const stripe = createStripeClient()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, getStripeWebhookSecret())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Stripe webhook signature.'

    return Response.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await updateProfileFromSubscription(event.data.object)
        break
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event.data.object)
        break
      default:
        break
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook handling failed', {
      eventType: event.type,
      message: error instanceof Error ? error.message : 'Unknown webhook error.',
    })

    return Response.json({ error: 'Webhook handler failed.' }, { status: 500 })
  }
}
