import { NextResponse } from 'next/server'
import { z } from 'zod'
import { listProjects } from '../../../lib/workspace/listProjects'

export async function GET() {
  const projects = await listProjects()
  return NextResponse.json({ ok: true, data: projects })
}
