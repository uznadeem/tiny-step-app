import { jsonError } from '@/lib/server/api'
import { createWaitlistUnsubscribeUrl, getAppUrl, getDashboardUrl, sendTemplateEmail } from '@/lib/server/email'
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'
import { getAppTimeZone } from '@/lib/server/time-zone'

type FollowupSubscriber = {
  id: string
  first_name: string
  email: string
  unsubscribe_token: string
}

type WeeklyNudgeProfile = {
  id: string
  email: string | null
  display_name: string | null
  preferences: unknown
}

export const runtime = 'nodejs'

const FOLLOWUP_BATCH_SIZE = 100
const FOLLOWUP_DELAY_DAYS = 5
const WEEKLY_NUDGE_BATCH_SIZE = 100

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    throw new Error('Missing CRON_SECRET.')
  }

  return request.headers.get('authorization') === `Bearer ${secret}`
}

function getFollowupThreshold() {
  return new Date(Date.now() - FOLLOWUP_DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

function getWeekdayInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
  }).format(new Date())
}

function isSundayInEmailTimeZone() {
  return getWeekdayInTimeZone(getAppTimeZone()) === 'Sunday'
}

function getFirstName(displayName: string | null) {
  const trimmed = displayName?.trim()

  if (!trimmed) {
    return 'there'
  }

  return trimmed.split(/\s+/)[0] || 'there'
}

function hasWeeklyNudgesEnabled(preferences: unknown) {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
    return false
  }

  return (preferences as { weeklyNudgeEmail?: unknown }).weeklyNudgeEmail === true
}

async function loadFollowupSubscribers() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('waitlist_subscribers')
    .select('id, first_name, email, unsubscribe_token')
    .eq('status', 'subscribed')
    .is('followup_sent_at', null)
    .not('welcome_sent_at', 'is', null)
    .lte('welcome_sent_at', getFollowupThreshold())
    .order('welcome_sent_at', { ascending: true })
    .limit(FOLLOWUP_BATCH_SIZE)

  if (error) {
    throw new Error('Unable to load waitlist follow-up recipients.')
  }

  return (data ?? []) as FollowupSubscriber[]
}

async function markFollowupSent(subscriberId: string) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('waitlist_subscribers')
    .update({ followup_sent_at: new Date().toISOString() })
    .eq('id', subscriberId)
    .is('followup_sent_at', null)

  if (error) {
    throw new Error('Unable to update follow-up email status.')
  }
}

async function sendWaitlistFollowups() {
  const subscribers = await loadFollowupSubscribers()
  let sent = 0
  const failures: Array<{ id: string; email: string; error: string }> = []

  for (const subscriber of subscribers) {
    try {
      await sendTemplateEmail({
        to: subscriber.email,
        type: 'waitlist_followup',
        variables: {
          app_url: getAppUrl(),
          dashboard_url: getDashboardUrl(),
          email: subscriber.email,
          first_name: subscriber.first_name,
          unsubscribe_url: createWaitlistUnsubscribeUrl(subscriber.unsubscribe_token),
        },
      })
      await markFollowupSent(subscriber.id)
      sent += 1
    } catch (error) {
      failures.push({
        id: subscriber.id,
        email: subscriber.email,
        error: error instanceof Error ? error.message : 'Follow-up email failed.',
      })
    }
  }

  return {
    attempted: subscribers.length,
    sent,
    failed: failures.length,
    failures,
  }
}

async function loadWeeklyNudgeProfiles() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, preferences')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })
    .limit(WEEKLY_NUDGE_BATCH_SIZE)

  if (error) {
    throw new Error('Unable to load weekly nudge recipients.')
  }

  return ((data ?? []) as WeeklyNudgeProfile[]).filter(profile => Boolean(profile.email) && hasWeeklyNudgesEnabled(profile.preferences))
}

async function sendWeeklyNudges() {
  if (!isSundayInEmailTimeZone()) {
    return {
      skipped: true,
      reason: `Not Sunday in ${getAppTimeZone()}.`,
      attempted: 0,
      sent: 0,
      failed: 0,
      failures: [] as Array<{ id: string; email: string; error: string }>,
    }
  }

  const profiles = await loadWeeklyNudgeProfiles()
  let sent = 0
  const failures: Array<{ id: string; email: string; error: string }> = []

  for (const profile of profiles) {
    if (!profile.email) continue

    try {
      await sendTemplateEmail({
        to: profile.email,
        type: 'weekly_nudge',
        variables: {
          app_url: getAppUrl(),
          dashboard_url: getDashboardUrl(),
          email: profile.email,
          first_name: getFirstName(profile.display_name),
          unsubscribe_url: getDashboardUrl(),
        },
      })
      sent += 1
    } catch (error) {
      failures.push({
        id: profile.id,
        email: profile.email,
        error: error instanceof Error ? error.message : 'Weekly nudge email failed.',
      })
    }
  }

  return {
    skipped: false,
    attempted: profiles.length,
    sent,
    failed: failures.length,
    failures,
  }
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return jsonError('Unauthorized.', 401)
    }

    const followups = await sendWaitlistFollowups()
    const weeklyNudges = await sendWeeklyNudges()

    return Response.json({
      ok: true,
      followups,
      weeklyNudges,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email cron failed.'
    const status = message === 'Missing CRON_SECRET.' ? 503 : 500

    return jsonError(message, status)
  }
}
