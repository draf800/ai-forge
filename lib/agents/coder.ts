import { z } from 'zod'
import { getAIProvider } from '../lib/ai/server'
import { ChatMessage } from '../lib/ai/provider'
import { extractJson } from '../lib/utils/json'

const Operation = z.object({
  type: z.enum(['create', 'update', 'delete']),
  path: z.string(),
  content: z.string().optional()
})

export const CoderResponse = z.object({
  operations: z.array(Operation)
})

export type OperationType = z.infer<typeof Operation>

export async function runCoder(opts: {
  prompt: string
  plan: any
  files: string[]
  fileContents: Record<string, string>
}) {
  const provider = getAIProvider()

  const system = `You are a coding agent. You will receive a plan and existing files. Reply with JSON only matching the schema: { "operations": [ { "type": "create|update|delete", "path": "relative/path", "content": "...optional..." } ] }. Do NOT include any explanations.`

  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: `Plan:\n${JSON.stringify(opts.plan, null, 2)}\n\nExisting files:\n${JSON.stringify(opts.files, null, 2)}` },
    { role: 'user', content: `File contents:\n${JSON.stringify(opts.fileContents, null, 2)}` },
    { role: 'user', content: `User request:\n${opts.prompt}` }
  ]

  const resp = await provider.createChatCompletion({ messages })
  const raw = resp.content

  const parsed = extractJson(raw)
  if (!parsed) {
    throw new Error('Coder did not return valid JSON')
  }

  const parsedRes = CoderResponse.safeParse(parsed)
  if (!parsedRes.success) {
    throw new Error('Coder response failed validation')
  }

  return parsedRes.data
}
