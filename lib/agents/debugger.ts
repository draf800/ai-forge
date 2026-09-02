export type DebuggerAdvice = {
  summary: string
  steps?: string[]
  operations?: { type: 'create'|'update'|'delete'; path: string; content?: string }[]
}

export type DebuggerInput = {
  command: string
  stdout: string
  stderr: string
  exitCode: number
  files: Record<string, string>
}

// Simple heuristics-based debugger to provide structured advice and possible fixes
export async function runDebugger(input: DebuggerInput): Promise<DebuggerAdvice> {
  const advice: DebuggerAdvice = { summary: 'Analysis complete', steps: [], operations: [] }

  if (input.stderr) {
    advice.steps?.push('Check stderr for stack traces and error lines.')
  }

  // Example heuristic: TypeScript errors -> possibly missing types or syntax error
  const stderr = (input.stderr || '').toLowerCase()
  if (stderr.includes('tsc') || stderr.includes('typescript') || /error ts\d{1,4}/.test(stderr)) {
    advice.steps?.push('TypeScript compilation failed. Inspect the reported file/line for type or syntax errors.')
    // Suggest running type-check (this is a hint; actual operation must be validated)
    // As a naive operation, if there is an obvious missing file mention, do not create it automatically.
  }

  // Missing module heuristic
  const match = /cannot find module ['"]([^'"]+)['"]/i.exec(input.stderr || '')
  if (match) {
    const mod = match[1]
    advice.steps?.push(`Missing module: ${mod}. Consider adding it to package.json dependencies and running npm install.`)
  }

  // If stdout/stderr contain syntax errors that point to a file, include that in steps
  const fileMatch = /at (.+):(\d+):(\d+)/.exec(input.stderr || input.stdout || '')
  if (fileMatch) {
    advice.steps?.push(`Error location: ${fileMatch[1]} line ${fileMatch[2]} col ${fileMatch[3]}`)
  }

  return advice
}
