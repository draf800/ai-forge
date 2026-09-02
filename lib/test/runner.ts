import child from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFile = promisify(child.execFile)

export type RunResult = { stdout: string; stderr: string; exitCode: number }

export const ALLOWED = {
  install: { cmd: 'npm', args: ['ci'] },
  lint: { cmd: 'npm', args: ['run', 'lint'] },
  'type-check': { cmd: 'npm', args: ['run', 'type-check'] },
  build: { cmd: 'npm', args: ['run', 'build'] }
} as const

export function isActionAllowed(action: string) {
  return Object.prototype.hasOwnProperty.call(ALLOWED, action)
}

export async function runCommand(projectRoot: string, action: keyof typeof ALLOWED, timeoutMs = 30_000): Promise<RunResult> {
  const mapped = ALLOWED[action]
  if (!mapped) throw new Error('Action not allowed')

  try {
    const execOpts: any = { cwd: projectRoot, timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }
    const { stdout, stderr } = await execFile(mapped.cmd, mapped.args, execOpts)
    return { stdout: String(stdout || ''), stderr: String(stderr || ''), exitCode: 0 }
  } catch (err: any) {
    const stdout = err.stdout ? String(err.stdout) : ''
    const stderr = err.stderr ? String(err.stderr) : err.message
    const code = typeof err.code === 'number' ? err.code : 1
    return { stdout, stderr, exitCode: code }
  }
}
