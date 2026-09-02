import { createProject } from '../lib/workspace/projects'
import { listFiles, readFile } from '../lib/workspace/fileManager'
import { runCoder } from '../lib/agents/coder'
import { runCommand, isActionAllowed } from '../lib/test/runner'
import { runDebugger } from '../lib/agents/debugger'
import { PlanSchema } from './planner'

export type OrchestratorResult = {
  plan: any | null
  applied: { created: string[]; updated: string[]; deleted: string[] }
  test?: { stdout: string; stderr: string; exitCode: number }
  debug?: any
  logs: string[]
  status: 'completed' | 'failed'
}

export async function runFullOrchestration(prompt: string, maxRepairAttempts = 2): Promise<OrchestratorResult> {
  const logs: string[] = []
  logs.push('orchestration:start')

  // 1. Planner
  logs.push('stage:planning')
  let plan
  try {
    // call planner dynamically to avoid circular imports
    const planner = await import('./planner')
    plan = await planner.createPlan(prompt)
    const planCheck = PlanSchema.safeParse(plan)
    if (!planCheck.success) {
      logs.push('planner:invalid')
      plan = { title: 'Generated Plan', steps: [] }
    } else {
      logs.push(`planner:ok:${plan.title}`)
    }
  } catch (err: any) {
    logs.push(`planner:error:${err.message}`)
    plan = { title: 'Generated Plan', steps: [] }
  }

  // 2. Ensure project
  logs.push('stage:project')
  const project = await createProject(plan.title || 'Generated App')
  logs.push(`project:created:${project.id}`)

  // 3. Inspect files
  logs.push('stage:inspect')
  const files = await listFiles(project.id)
  const fileContents: Record<string, string> = {}
  for (const f of files) {
    try { fileContents[f] = await readFile(project.id, f) } catch (e) { fileContents[f] = '' }
  }

  // 4. Coding
  logs.push('stage:coding')
  let coderResp
  try {
    coderResp = await runCoder({ prompt, plan, files, fileContents })
    logs.push('coder:ok')
  } catch (err: any) {
    logs.push(`coder:error:${err.message}`)
    return { plan, applied: { created: [], updated: [], deleted: [] }, logs, status: 'failed' }
  }

  // 5. Apply operations
  logs.push('stage:applying')
  const applied = { created: [] as string[], updated: [] as string[], deleted: [] as string[] }
  const fm = await import('../lib/workspace/fileManager')
  for (const op of coderResp.operations) {
    try {
      if (op.type === 'create') {
        await fm.createFile(project.id, op.path, op.content ?? '')
        applied.created.push(op.path)
        logs.push(`applied:create:${op.path}`)
      } else if (op.type === 'update') {
        await fm.updateFile(project.id, op.path, op.content ?? '')
        applied.updated.push(op.path)
        logs.push(`applied:update:${op.path}`)
      } else if (op.type === 'delete') {
        await fm.deleteFile(project.id, op.path)
        applied.deleted.push(op.path)
        logs.push(`applied:delete:${op.path}`)
      }
    } catch (err: any) {
      logs.push(`apply:error:${op.path}:${err.message}`)
    }
  }

  // 6. Testing
  logs.push('stage:testing')
  const testResult = await runCommand(project.root, 'type-check')
  logs.push(`test:exit:${testResult.exitCode}`)

  if (testResult.exitCode === 0) {
    logs.push('orchestration:success')
    return { plan, applied, test: testResult, logs, status: 'completed' }
  }

  // 7. If failure -> debugging & limited repair attempts
  logs.push('stage:debugging')
  let attempts = 0
  let currentTest = testResult
  let debugInfo: any = null
  while (attempts < maxRepairAttempts && currentTest.exitCode !== 0) {
    attempts++
    logs.push(`debug:attempt:${attempts}`)
    const dbg = await runDebugger({ command: 'type-check', stdout: currentTest.stdout, stderr: currentTest.stderr, exitCode: currentTest.exitCode, files: fileContents })
    logs.push(`debug:advice:${dbg.summary}`)
    debugInfo = dbg

    // If debugger suggests operations, validate and apply
    if ((dbg as any).operations && Array.isArray((dbg as any).operations) && (dbg as any).operations.length > 0) {
      logs.push('debug:operations:apply')
      for (const op of (dbg as any).operations) {
        try {
          if (op.type === 'create') { await fm.createFile(project.id, op.path, op.content ?? '') }
          else if (op.type === 'update') { await fm.updateFile(project.id, op.path, op.content ?? '') }
          else if (op.type === 'delete') { await fm.deleteFile(project.id, op.path) }
          logs.push(`debug:applied:${op.type}:${op.path}`)
        } catch (err: any) {
          logs.push(`debug:apply:error:${err.message}`)
        }
      }
    }

    // Rerun tests
    currentTest = await runCommand(project.root, 'type-check')
    logs.push(`test:exit:${currentTest.exitCode}`)
    if (currentTest.exitCode === 0) {
      logs.push('orchestration:repaired')
      return { plan, applied, test: currentTest, debug: debugInfo, logs, status: 'completed' }
    }
  }

  logs.push('orchestration:failed')
  return { plan, applied, test: currentTest, debug: debugInfo, logs, status: 'failed' }
}
