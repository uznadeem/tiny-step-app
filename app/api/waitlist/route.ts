import { isRecord, jsonError, parseString } from '@/lib/server/api'
import { createWaitlistUnsubscribeUrl, getAppUrl, getDashboardUrl, sendTemplateEmail } from '@/lib/server/email'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

type WaitlistSubscriber = {
  id: string
  first_name: string
  email: string
  status: string
  welcome_sent_at: string | null
  unsubscribe_token: string
}

export const runtime = 'nodejs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizeFirstName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

async function upsertSubscriber(firstName: string, email: string): Promise<WaitlistSubscriber> {
  const supabase = createSupabaseAdminClient()
  const { data: existing, error: selectError } = await supabase
    .from('waitlist_subscribers')
    .select('id, first_name, email, status, welcome_sent_at, unsubscribe_token')
    .eq('email', email)
    .maybeSingle()

  if (selectError) {
    throw new Error('Unable to check waitlist subscriber.')
  }

  if (existing) {
    const { data, error } = await supabase
      .from('waitlist_subscribers')
      .update({
        first_name: firstName,
        status: existing.status === 'unsubscribed' ? 'subscribed' : existing.status,
      })
      .eq('id', existing.id)
      .select('id, first_name, email, status, welcome_sent_at, unsubscribe_token')
      .single()

    if (error || !data) {
      throw new Error('Unable to update waitlist subscriber.')
    }

    return data
  }

  const { data, error } = await supabase
    .from('waitlist_subscribers')
    .insert({
      first_name: firstName,
      email,
      status: 'subscribed',
    })
    .select('id, first_name, email, status, welcome_sent_at, unsubscribe_token')
    .single()

  if (error || !data) {
    throw new Error('Unable to create waitlist subscriber.')
  }

  return data
}

async function markWelcomeSent(subscriberId: string) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('waitlist_subscribers')
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq('id', subscriberId)
    .is('welcome_sent_at', null)

  if (error) {
    throw new Error('Unable to update welcome email status.')
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    if (!isRecord(body)) {
      return jsonError('Invalid request body.', 400)
    }

    const firstName = normalizeFirstName(parseString(body.firstName ?? body.first_name))
    const email = normalizeEmail(parseString(body.email))

    if (!firstName) {
      return jsonError('First name is required.', 400)
    }

    if (firstName.length > 80) {
      return jsonError('First name is too long.', 400)
    }

    if (!email || !EMAIL_PATTERN.test(email)) {
      return jsonError('Enter a valid email address.', 400)
    }

    if (email.length > 254) {
      return jsonError('Email address is too long.', 400)
    }

    const subscriber = await upsertSubscriber(firstName, email)

    if (!subscriber.welcome_sent_at) {
      await sendTemplateEmail({
        to: subscriber.email,
        type: 'waitlist_welcome',
        variables: {
          app_url: getAppUrl(),
          dashboard_url: getDashboardUrl(),
          email: subscriber.email,
          first_name: subscriber.first_name,
          unsubscribe_url: createWaitlistUnsubscribeUrl(subscriber.unsubscribe_token),
        },
      })
      await markWelcomeSent(subscriber.id)
    }

    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Waitlist request failed.'
    const status =
      message.startsWith('Missing ') || message === 'Missing waitlist_welcome email template.'
        ? 503
        : message === 'Email delivery failed.'
          ? 502
          : 500

    return jsonError(message, status)
  }
}
