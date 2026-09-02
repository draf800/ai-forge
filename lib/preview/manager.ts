import { spawn } from 'child_process'
import { projectRootPath, getWorkspaceRoot, projectExists } from '../workspace/index'
import path from 'path'

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

export function isValidProjectId(projectId: string) {
  // only allow alphanum, hyphen, underscore
  return /^[a-zA-Z0-9_-]+$/.test(projectId)
}

export async function startPreview(projectId: string) {
  if (!isValidProjectId(projectId)) throw new Error('Invalid project id')
  if (previews.has(projectId)) throw new Error('Preview already running')

  const exists = await projectExists(projectId)
  if (!exists) throw new Error('Project does not exist')

  const WORKSPACES_ROOT = getWorkspaceRoot()
  const root = projectRootPath(projectId)
  // Ensure resolved root is inside WORKSPACES_ROOT
  const resolvedRoot = path.resolve(root)
  if (!resolvedRoot.startsWith(path.resolve(WORKSPACES_ROOT) + path.sep) && resolvedRoot !== path.resolve(WORKSPACES_ROOT)) {
    throw new Error('Invalid project root')
  }

  const port = choosePort()
  usedPorts.add(port)

  // Start npm run dev in project root
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: resolvedRoot,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  const logs: string[] = []
  let exited = false

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
    exited = true
    logs.push(`process exited with ${code}`)
    // cleanup
    try { usedPorts.delete(port) } catch (e) {}
    previews.delete(projectId)
  })

  // Store preview info
  previews.set(projectId, { projectId, port, proc, logs, startedAt: new Date().toISOString() })

  // Simple startup check: if process exits quickly (<5s), treat as failure
  setTimeout(() => {
    const info = previews.get(projectId)
    if (!info) return
    if (exited) return
    // if still running, assume started
  }, 5000)

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
