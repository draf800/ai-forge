import { AIProvider, ChatMessage } from './provider'

const OPENROUTER_URL = 'https://api.openrouter.ai/v1/chat/completions'

export class OpenRouterProvider implements AIProvider {
  apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createChatCompletion(opts: { model?: string; messages: ChatMessage[] }): Promise<{ content: string }> {
    const model = opts.model || process.env.OPENROUTER_MODEL || 'gpt-4o-mini'

    const body = {
      model,
      messages: opts.messages.map(m => ({ role: m.role, content: m.content })),
      // keep response deterministic-ish for now
      temperature: 0.2,
      max_tokens: 1500
    }

    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenRouter error: ${res.status} ${text}`)
    }

    const data = await res.json()
    // OpenRouter responses can vary; try to extract message content
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? JSON.stringify(data)

    return { content }
  }
}
