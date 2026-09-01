export type DebuggerAdvice = {
  summary: string
  steps?: string[]
}

export type DebuggerInput = {
  command: string
  stdout: string
  stderr: string
  exitCode: number
  files: Record<string, string>
}

export async function runDebugger(input: DebuggerInput): Promise<DebuggerAdvice> {
  // For stage 3, we provide a placeholder implementation that returns a high-level hint.
  const advice: DebuggerAdvice = {
    summary: 'Debugger placeholder: analyze the failure output and suggest fixes',
    steps: []
  }

  if (input.stderr) {
    advice.steps?.push('Review stderr output for stack traces or errors')
  }
  if (input.exitCode !== 0) {
    advice.steps?.push(`Command exited with code ${input.exitCode}`)
  }

  return advice
}
