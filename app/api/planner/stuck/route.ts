import { jsonError, parseString } from '@/lib/server/api'
import { createAnthropicMessage } from '@/lib/server/anthropic'
import { consumeLlmQuota, LlmQuotaError, quotaExceededMessage, quotaHeaders, type LlmQuota } from '@/lib/server/llm-quota'
import { getAuthenticatedUser } from '@/lib/server/supabase'

export const runtime = 'nodejs'

function normalizeRemainingSteps(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map(step => parseString(step))
    .filter(Boolean)
    .slice(0, 8)
}

export async function POST(request: Request) {
  let quota: LlmQuota | null = null

  try {
    const authenticated = await getAuthenticatedUser(request)

    if (!authenticated) {
      return jsonError('Unauthorized.', 401)
    }

    const body = await request.json()
    const taskName = parseString(body?.taskName)
    const remainingSteps = normalizeRemainingSteps(body?.remainingSteps)

    if (!taskName) {
      return jsonError('Task name is required.', 400)
    }

    if (taskName.length > 500) {
      return jsonError('Task name is too long.', 400)
    }

    if (!remainingSteps.length) {
      return jsonError('At least one remaining step is required.', 400)
    }

    quota = await consumeLlmQuota(authenticated.id)
    const headers = quotaHeaders(quota)

    if (!quota.allowed) {
      return jsonError(quotaExceededMessage(quota), 429, headers)
    }

    const advice = await createAnthropicMessage({
      maxTokens: 220,
      system:
        'You are a warm ADHD coach. Give ONE very specific, compassionate tip to help someone get unstuck on their task. 2-3 sentences max. Be practical, warm, not preachy.',
      messages: [
        {
          role: 'user',
          content: `I'm stuck on: ${taskName}. Remaining steps: ${remainingSteps.join(', ')}`,
        },
      ],
    })

    const normalizedAdvice =
      advice.trim() || "Take a 5-minute walk and come back. Movement can help reset an ADHD brain. You've got this."

    return Response.json({ advice: normalizedAdvice }, { headers })
  } catch (error) {
    const message =
      error instanceof LlmQuotaError
        ? 'Unable to verify AI usage quota.'
        : error instanceof Error
          ? error.message
          : 'Stuck advice request failed.'
    const status =
      error instanceof LlmQuotaError ? 503 : message === 'Missing ANTHROPIC_API_KEY.' ? 503 : message === 'AI planner request failed.' ? 502 : 500

    return jsonError(message, status, quota ? quotaHeaders(quota) : undefined)
  }
}
