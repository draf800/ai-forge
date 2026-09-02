import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPreviewStatus } from '../../../../lib/preview/manager'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 })
  const status = getPreviewStatus(projectId)
  if (!status) return NextResponse.json({ ok: false, error: 'Not running' }, { status: 404 })
  return NextResponse.json({ ok: true, data: status })
}
