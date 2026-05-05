type AnthropicMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AnthropicMessageOptions = {
  system: string
  messages: AnthropicMessage[]
  maxTokens: number
}

export async function createAnthropicMessage({ system, messages, maxTokens }: AnthropicMessageOptions) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error('AI planner request failed.')
  }

  const data = await response.json()

  return Array.isArray(data?.content)
    ? data.content
        .map((block: unknown) =>
          typeof block === 'object' &&
          block !== null &&
          'type' in block &&
          'text' in block &&
          block.type === 'text' &&
          typeof block.text === 'string'
            ? block.text
            : ''
        )
        .join('')
    : ''
}
