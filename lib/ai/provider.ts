// Server-side AI provider interface
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export interface AIProvider {
  createChatCompletion: (opts: { model?: string; messages: ChatMessage[] }) => Promise<{ content: string }>
}
