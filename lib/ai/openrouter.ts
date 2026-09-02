import { ChatMessage, AIProvider } from './provider'

const OPENROUTER_URL = 'https://api.openrouter.ai/v1/chat/completions'

export class OpenRouterError extends Error {
  status?: number
  details?: any
  constructor(message: string, status?: number, details?: any) {
    super(message)
    this.name = 'OpenRouterError'
    this.status = status
    this.details = details
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class OpenRouterProvider implements AIProvider {
  apiKey: string
  maxRetries: number
  baseBackoffMs: number

  constructor(apiKey: string, opts?: { maxRetries?: number; baseBackoffMs?: number }) {
    this.apiKey = apiKey
    this.maxRetries = opts?.maxRetries ?? 2
    this.baseBackoffMs = opts?.baseBackoffMs ?? 500
  }

  async createChatCompletion(opts: { model?: string; messages: ChatMessage[] }): Promise<{ content: string }> {
    const model = opts.model || process.env.OPENROUTER_MODEL || 'gpt-4o-mini'
    const body = {
      model,
      messages: opts.messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.2,
      max_tokens: 1500
    }

    let attempt = 0
    while (true) {
      try {
        const res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body)
        })

        const text = await res.text()
        if (!res.ok) {
          // Try to parse structured message from provider but never include api key
          let details = undefined
          try { details = JSON.parse(text) } catch (e) { details = text }
          // For 5xx, we can retry
          if (res.status >= 500 && attempt < this.maxRetries) {
            attempt++
            const backoff = this.baseBackoffMs * Math.pow(2, attempt - 1)
            await sleep(backoff)
            continue
          }
          throw new OpenRouterError(`OpenRouter request failed with status ${res.status}`, res.status, details)
        }

        let data
        try { data = JSON.parse(text) } catch (e) { data = text }
        const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? (typeof data === 'string' ? data : JSON.stringify(data))
        return { content }
      } catch (err: any) {
        // Network error or fetch error
        if (attempt < this.maxRetries) {
          attempt++
          const backoff = this.baseBackoffMs * Math.pow(2, attempt - 1)
          await sleep(backoff)
          continue
        }
        if (err instanceof OpenRouterError) throw err
        throw new OpenRouterError('OpenRouter request failed: ' + String(err?.message ?? err), undefined, undefined)
      }
    }
  }
}
