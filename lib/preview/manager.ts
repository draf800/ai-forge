import { spawn } from 'child_process'
import { RunResult } from '../test/runner'
import { projectRootPath } from '../workspace/index'
import { ensureWorkspacesRoot } from '../workspace/index'

type PreviewInfo = {
  projectId: string
  port: number
  proc: any
  logs: string[]
  startedAt: string
}

const previews = new Map<string, PreviewInfo>()
const usedPorts = new Set<number>()

function choosePort() {
  for (let p = 4000; p < 5000; p++) {
    if (!usedPorts.has(p)) return p
  }
  throw new Error('No available preview ports')
}

export async function startPreview(projectId: string) {
  if (previews.has(projectId)) throw new Error('Preview already running')
  await ensureWorkspacesRoot()
  const root = projectRootPath(projectId)
  const port = choosePort()
  usedPorts.add(port)

  // Start npm run dev in project root
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  const logs: string[] = []
  proc.stdout.on('data', (d: Buffer) => {
    const s = d.toString()
    logs.push(s)
    if (logs.length > 1000) logs.shift()
  })
  proc.stderr.on('data', (d: Buffer) => {
    const s = d.toString()
    logs.push(s)
    if (logs.length > 1000) logs.shift()
  })
  proc.on('exit', (code: number) => {
    logs.push(`process exited with ${code}`)
  })

  previews.set(projectId, { projectId, port, proc, logs, startedAt: new Date().toISOString() })

  return { port }
}

export async function stopPreview(projectId: string) {
  const info = previews.get(projectId)
  if (!info) throw new Error('Preview not running')
  try {
    info.proc.kill('SIGTERM')
  } catch (e) {}
  usedPorts.delete(info.port)
  previews.delete(projectId)
}

export function getPreviewStatus(projectId: string) {
  const info = previews.get(projectId)
  if (!info) return null
  return { projectId: info.projectId, port: info.port, startedAt: info.startedAt, logs: info.logs.slice(-200) }
}
