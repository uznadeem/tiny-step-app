type OpenAIMessage = {
  role: 'system' | 'user'
  content: string
}

type OpenAIChatOptions = {
  messages: OpenAIMessage[]
  maxTokens: number
  json?: boolean
}

export async function createOpenAIChatCompletion({ messages, maxTokens, json = false }: OpenAIChatOptions) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error('AI planner request failed.')
  }

  const data = await response.json()
  return typeof data?.choices?.[0]?.message?.content === 'string'
    ? data.choices[0].message.content
    : ''
}
