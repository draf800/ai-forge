import { OpenRouterProvider } from '../lib/ai/openrouter'
import { AIProvider } from '../lib/ai/provider'

let provider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (provider) return provider

  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY is not configured on the server')

  provider = new OpenRouterProvider(key)
  return provider
}
