import { jsonError } from '@/lib/server/api'
import { createWaitlistUnsubscribeUrl, getAppUrl, getDashboardUrl, sendTemplateEmail } from '@/lib/server/email'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'

type LaunchSubscriber = {
  id: string
  first_name: string
  email: string
  unsubscribe_token: string
}

export const runtime = 'nodejs'

const LAUNCH_BATCH_SIZE = 200

async function loadLaunchSubscribers() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('waitlist_subscribers')
    .select('id, first_name, email, unsubscribe_token')
    .eq('status', 'subscribed')
    .is('launch_sent_at', null)
    .order('welcome_sent_at', { ascending: true, nullsFirst: false })
    .limit(LAUNCH_BATCH_SIZE)

  if (error) {
    throw new Error('Unable to load launch email recipients.')
  }

  return (data ?? []) as LaunchSubscriber[]
}

async function markLaunchSent(subscriberId: string) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('waitlist_subscribers')
    .update({ launch_sent_at: new Date().toISOString() })
    .eq('id', subscriberId)
    .is('launch_sent_at', null)

  if (error) {
    throw new Error('Unable to update launch email status.')
  }
}

export async function POST() {
  try {
    const subscribers = await loadLaunchSubscribers()
    let sent = 0
    const failures: Array<{ id: string; email: string; error: string }> = []

    for (const subscriber of subscribers) {
      try {
        await sendTemplateEmail({
          to: subscriber.email,
          type: 'waitlist_launch',
          variables: {
            app_url: `${getAppUrl()}/signup`,
            dashboard_url: getDashboardUrl(),
            email: subscriber.email,
            first_name: subscriber.first_name,
            unsubscribe_url: createWaitlistUnsubscribeUrl(subscriber.unsubscribe_token),
          },
        })
        await markLaunchSent(subscriber.id)
        sent += 1
      } catch (error) {
        failures.push({
          id: subscriber.id,
          email: subscriber.email,
          error: error instanceof Error ? error.message : 'Launch email failed.',
        })
      }
    }

    return Response.json({
      ok: failures.length === 0,
      attempted: subscribers.length,
      sent,
      failed: failures.length,
      failures,
      batchLimit: LAUNCH_BATCH_SIZE,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Launch email request failed.'

    return jsonError(message, message.startsWith('Missing ') ? 503 : 500)
  }
}
