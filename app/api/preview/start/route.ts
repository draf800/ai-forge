import { NextResponse } from 'next/server'
import { z } from 'zod'
import { startPreview } from '../../../../lib/preview/manager'
import { projectExists } from '../../../../lib/workspace/index'

const Body = z.object({ projectId: z.string() })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 })
    const { projectId } = parsed.data
    const exists = await projectExists(projectId)
    if (!exists) return NextResponse.json({ ok: false, error: 'Project not found' }, { status: 404 })
    try {
      const info = await startPreview(projectId)
      return NextResponse.json({ ok: true, data: info })
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 })
  }
}
