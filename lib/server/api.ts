export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

export function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain JSON.')
  }

  return JSON.parse(cleaned.slice(start, end + 1))
}
