import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stopPreview } from '../../../../lib/preview/manager'

const Body = z.object({ projectId: z.string() })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 })
    const { projectId } = parsed.data
    await stopPreview(projectId)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 })
  }
}
