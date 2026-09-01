export type Plan = {
  title: string
  steps: string[]
}

import { ChatMessage } from '../lib/ai/provider'
import { getAIProvider } from '../lib/ai/server'
import { z } from 'zod'

const PLAN_PROMPT = `You are a software engineering planner. Given a short description of an application, produce a concise project plan. Return JSON only with { title: string, steps: string[] }.`

export const PlanSchema = z.object({
  title: z.string(),
  steps: z.array(z.string())
})

export async function createPlan(prompt: string): Promise<Plan> {
  const provider = getAIProvider()

  const messages: ChatMessage[] = [
    { role: 'system', content: PLAN_PROMPT },
    { role: 'user', content: prompt }
  ]

  const resp = await provider.createChatCompletion({ messages })

  // Try to parse JSON from the AI output safely
  const raw = resp.content
  let parsed: any = null
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    // Sometimes the model replies with markdown or text; attempt to extract JSON block
    const match = raw.match(/```json([\s\S]*?)```/i)
    if (match) {
      try {
        parsed = JSON.parse(match[1])
      } catch (err) {
        // fall-through
      }
    }
  }

  if (!parsed) {
    // Fallback: return single-step plan with raw content
    return {
      title: 'Generated Plan',
      steps: [raw]
    }
  }

  const parsedRes = PlanSchema.safeParse(parsed)
  if (!parsedRes.success) {
    return {
      title: parsed.title ?? 'Generated Plan',
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [JSON.stringify(parsed)]
    }
  }

  return parsedRes.data
}
