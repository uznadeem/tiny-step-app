import { extractJson, isRecord, jsonError, parseString } from '@/lib/server/api'
import { createAnthropicMessage } from '@/lib/server/anthropic'
import { consumeLlmQuota, LlmQuotaError, quotaExceededMessage, quotaHeaders, type LlmQuota } from '@/lib/server/llm-quota'
import { getAuthenticatedUser } from '@/lib/server/supabase'

const ENERGY_LABELS: Record<number, string> = {
  1: 'Running on fumes',
  2: 'Low but here',
  3: 'Medium energy',
  4: 'Feeling good',
  5: 'Hyperfocus mode',
}

type PlannerStep = {
  text: string
  time: number
  tip: string | null
}

type PlannerResponse = {
  steps: PlannerStep[]
}

export const runtime = 'nodejs'

function normalizePlannerResponse(value: unknown): PlannerResponse {
  if (!isRecord(value) || !Array.isArray(value.steps)) {
    throw new Error('AI returned an invalid planner response.')
  }

  const steps = value.steps
    .slice(0, 8)
    .map((step): PlannerStep | null => {
      if (!isRecord(step)) return null

      const text = parseString(step.text)
      const time = typeof step.time === 'number' && Number.isFinite(step.time) ? Math.max(1, Math.min(15, Math.round(step.time))) : 2
      const tip = typeof step.tip === 'string' && step.tip.trim() ? step.tip.trim() : null

      if (!text) return null

      return { text, time, tip }
    })
    .filter((step): step is PlannerStep => Boolean(step))

  if (steps.length < 4) {
    throw new Error('AI returned too few usable planner steps.')
  }

  return {
    steps,
  }
}

export async function POST(request: Request) {
  let quota: LlmQuota | null = null

  try {
    const authenticated = await getAuthenticatedUser(request)

    if (!authenticated) {
      return jsonError('Unauthorized.', 401)
    }

    const body = await request.json()
    const task = parseString(body?.task)
    const brainDump = parseString(body?.brainDump)
    const energy = typeof body?.energy === 'number' && ENERGY_LABELS[body.energy] ? body.energy : 3

    if (!task) {
      return jsonError('Task is required.', 400)
    }

    if (task.length > 500) {
      return jsonError('Task is too long.', 400)
    }

    if (brainDump.length > 2000) {
      return jsonError('Brain dump is too long.', 400)
    }

    const energyLabel = ENERGY_LABELS[energy]

    quota = await consumeLlmQuota(authenticated.id)
    const headers = quotaHeaders(quota)

    if (!quota.allowed) {
      return jsonError(quotaExceededMessage(quota), 429, headers)
    }

    const text = await createAnthropicMessage({
      maxTokens: 1400,
      system: `You are a warm, supportive ADHD coach for women. Break tasks into tiny, dopamine-friendly micro-steps.
Return ONLY valid JSON like this (no markdown, no extra text):
{"steps": [{"text": "step description", "time": 2, "tip": "optional ADHD-friendly tip or null"}]}
Rules:
- 4-8 steps max
- Each step should take 1-5 minutes
- Use action verbs, be specific, be encouraging
- Tips should be practical ADHD hacks (body double, music, reward, etc.)
- Consider energy level: ${energyLabel}
- Make first step IMPOSSIBLY easy (under 1 min) to beat task paralysis`,
      messages: [
        {
          role: 'user',
          content: brainDump ? `Task: ${task}\nBrain dump: ${brainDump}` : `Task: ${task}`
        }
      ]
    })
    const parsed = normalizePlannerResponse(extractJson(text))

    return Response.json(parsed, { headers })
  } catch (error) {
    const message =
      error instanceof LlmQuotaError
        ? 'Unable to verify AI usage quota.'
        : error instanceof Error
          ? error.message
          : 'Planner request failed.'
    const status =
      error instanceof LlmQuotaError ? 503 : message === 'Missing ANTHROPIC_API_KEY.' ? 503 : message === 'AI planner request failed.' ? 502 : 500

    return jsonError(message, status, quota ? quotaHeaders(quota) : undefined)
  }
}
