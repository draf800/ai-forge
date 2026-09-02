import { NextResponse } from 'next/server'
import { getPreviewStatus } from '../../../../../lib/preview/manager'

export async function GET(request: Request) {
  // route: /api/preview/proxy/[projectId]
  const { pathname } = new URL(request.url)
  // pathname is like /api/preview/proxy/{projectId}
  const parts = pathname.split('/').filter(Boolean)
  const idx = parts.indexOf('proxy')
  const projectId = parts[idx + 1]
  if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 })
  const status = getPreviewStatus(projectId)
  if (!status) return NextResponse.json({ ok: false, error: 'Preview not running' }, { status: 404 })

  const port = status.port
  // Build target URL by taking the remainder of path after projectId
  const subpath = parts.slice(idx + 2).join('/')
  const target = `http://127.0.0.1:${port}/${subpath}`

  try {
    const res = await fetch(target, { method: 'GET' })
    const headers = Object.fromEntries(res.headers.entries())
    const body = await res.arrayBuffer()
    return new NextResponse(body, { status: res.status, headers })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Preview proxy error', details: String(err?.message ?? err) }, { status: 502 })
  }
}
