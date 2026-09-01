import { createPlan, Plan } from './planner'

export type OrchestratorResult = {
  plan: Plan | null
  logs: string[]
}

export async function runOrchestration(prompt: string): Promise<OrchestratorResult> {
  const logs: string[] = []
  logs.push('Orchestration started')

  try {
    logs.push('Generating plan (Planner)')
    const plan = await createPlan(prompt)
    logs.push(`Plan generated: ${plan.title}`)

    // For stage 2, we only run the planner. In future we'll call other agents.
    logs.push('Orchestration completed')

    return { plan, logs }
  } catch (err: any) {
    logs.push(`Error: ${err?.message ?? String(err)}`)
    return { plan: null, logs }
  }
}
