import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPreviewStatus } from '../../../../../lib/preview/manager'

export async function handler(request: Request) {
  const { pathname, search } = new URL(request.url)
  const parts = pathname.split('/').filter(Boolean)
  const idx = parts.indexOf('proxy')
  const projectId = parts[idx + 1]
  if (!projectId) return NextResponse.json({ ok: false, error: 'Missing projectId' }, { status: 400 })
  const status = getPreviewStatus(projectId)
  if (!status) return NextResponse.json({ ok: false, error: 'Preview not running' }, { status: 404 })
  const port = status.port

  // Build target URL
  const subpath = parts.slice(idx + 2).join('/')
  const qs = search || ''
  const target = `http://127.0.0.1:${port}/${subpath}${qs}`

  try {
    const method = request.method
    const headers = {} as Record<string, string>
    request.headers.forEach((v, k) => {
      if (['host', 'authorization', 'cookie'].includes(k.toLowerCase())) return
      headers[k] = v
    })

    const body = await request.arrayBuffer().catch(() => null)
    const res = await fetch(target, { method, headers, body: body || undefined })
    const respHeaders = Object.fromEntries(res.headers.entries())
    const respBody = await res.arrayBuffer()
    return new NextResponse(respBody, { status: res.status, headers: respHeaders })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'Preview proxy error' }, { status: 502 })
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE }
