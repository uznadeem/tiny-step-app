import { createSupabaseAdminClient } from '@/lib/server/supabase-admin'
import { getAppTimeZone } from '@/lib/server/time-zone'

const DEFAULT_DAILY_LIMIT = 20

export type LlmQuota = {
  allowed: boolean
  used: number
  remaining: number
  limit: number
  resetAt: string
}

type QuotaRow = {
  allowed: boolean
  used: number
  remaining: number
  daily_limit: number
  reset_at: string
}

export class LlmQuotaError extends Error {
  constructor(message = 'Unable to verify AI usage quota.') {
    super(message)
    this.name = 'LlmQuotaError'
  }
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function normalizeQuotaRow(value: unknown): QuotaRow | null {
  if (!value || typeof value !== 'object') return null

  const row = value as Partial<QuotaRow>
  if (
    typeof row.allowed !== 'boolean' ||
    typeof row.used !== 'number' ||
    typeof row.remaining !== 'number' ||
    typeof row.daily_limit !== 'number' ||
    typeof row.reset_at !== 'string'
  ) {
    return null
  }

  return row as QuotaRow
}

export async function consumeLlmQuota(userId: string): Promise<LlmQuota> {
  const dailyLimit = parsePositiveInteger(process.env.LLM_DAILY_LIMIT, DEFAULT_DAILY_LIMIT)
  const timeZone = getAppTimeZone()
  let supabase: ReturnType<typeof createSupabaseAdminClient>

  try {
    supabase = createSupabaseAdminClient()
  } catch {
    throw new LlmQuotaError()
  }

  const { data, error } = await supabase.rpc('consume_llm_quota', {
    p_user_id: userId,
    p_daily_limit: dailyLimit,
    p_time_zone: timeZone,
  })

  if (error) {
    throw new LlmQuotaError(error.message)
  }

  const row = normalizeQuotaRow(Array.isArray(data) ? data[0] : data)
  if (!row) {
    throw new LlmQuotaError()
  }

  return {
    allowed: row.allowed,
    used: row.used,
    remaining: row.remaining,
    limit: row.daily_limit,
    resetAt: row.reset_at,
  }
}

export function quotaHeaders(quota: LlmQuota) {
  return {
    'X-RateLimit-Limit': String(quota.limit),
    'X-RateLimit-Remaining': String(quota.remaining),
    'X-RateLimit-Reset': quota.resetAt,
  }
}

export function quotaExceededMessage(quota: LlmQuota) {
  const resetTime = new Date(quota.resetAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return `You've used your ${quota.limit} AI calls for today. Your limit resets at ${resetTime}.`
}
