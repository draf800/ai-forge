import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runOrchestration } from '../../../lib/orchestrator'

const BodySchema = z.object({
  prompt: z.string().min(3)
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request', issues: parsed.error.format() }, { status: 400 })
    }

    const { prompt } = parsed.data

    const result = await runOrchestration(prompt)

    return NextResponse.json({ ok: true, data: result })
  } catch (err: any) {
    // Do not leak secrets or remote error details
    const message = err?.message ?? 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
