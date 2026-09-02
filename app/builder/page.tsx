'use client'
import { useState } from 'react'

type Stage = 'idle'|'planning'|'coding'|'applying'|'testing'|'debugging'|'retesting'|'completed'|'failed'

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const [operations, setOperations] = useState<any[]>([])
  const [applied, setApplied] = useState<{ created: string[]; updated: string[]; deleted: string[] } | null>(null)
  const [testResult, setTestResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  function appendLog(l: string) { setLogs(prev => [...prev, l]) }

  async function startBuild() {
    setStage('planning')
    setLogs([])
    setOperations([])
    setApplied(null)
    setTestResult(null)
    setError(null)

    appendLog('Build started')

    try {
      const res = await fetch('/api/build', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Build failed')
        setStage('failed')
        appendLog('Build failed: ' + (data?.error || 'Unknown'))
        return
      }

      const result = data.data
      // Map logs to stages
      for (const l of result.logs || []) {
        appendLog(l)
        if (l.startsWith('stage:planning')) setStage('planning')
        else if (l.startsWith('stage:coding')) setStage('coding')
        else if (l.startsWith('stage:applying')) setStage('applying')
        else if (l.startsWith('stage:testing')) setStage('testing')
        else if (l.startsWith('stage:debugging')) setStage('debugging')
      }

      setOperations([])
      // Show applied files
      setApplied(result.applied || null)
      setTestResult(result.test || null)
      setStage(result.status === 'completed' ? 'completed' : 'failed')

    } catch (err: any) {
      setError(String(err.message || err))
      setStage('failed')
      appendLog('Network or unexpected error: ' + String(err))
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Builder</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <label className="block text-sm mb-2">Describe the application you want to build</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-56 p-4 bg-[#071826] border border-[#0b1620] rounded text-white" placeholder="e.g. A task manager with authentication and a dashboard..." />

          <div className="flex items-center gap-3 mt-3">
            <button onClick={startBuild} className="px-4 py-2 bg-[#7c3aed] rounded">Build application</button>
            <div className="text-sm text-[#9aa7b7]">Stage: <span className="font-medium text-white">{stage}</span></div>
          </div>

          <div className="mt-4 bg-[#071522] p-3 rounded border border-[#0b1620]">
            <h3 className="text-sm font-medium mb-2">Activity / Logs</h3>
            <div className="text-xs text-[#9aa7b7] max-h-40 overflow-auto">
              {logs.length === 0 ? <div className="text-[#6b7280]">No activity yet</div> : (
                <ul className="space-y-1">
                  {logs.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              )}
            </div>
          </div>

          {applied && (
            <div className="mt-4 bg-[#071522] p-3 rounded border border-[#0b1620]">
              <h3 className="text-sm font-medium mb-2">Files changed</h3>
              <div className="text-xs text-[#9aa7b7]">
                <div>Created: {applied.created.join(', ') || '—'}</div>
                <div>Updated: {applied.updated.join(', ') || '—'}</div>
                <div>Deleted: {applied.deleted.join(', ') || '—'}</div>
              </div>
            </div>
          )}

          {testResult && (
            <div className="mt-4 bg-[#071522] p-3 rounded border border-[#0b1620]">
              <h3 className="text-sm font-medium mb-2">Test Result</h3>
              <pre className="text-xs text-[#9aa7b7] max-h-64 overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-[#2b0f12] p-3 rounded border border-[#5f1220] text-[#ffb4b4]">
              <h3 className="text-sm font-medium mb-2">Error</h3>
              <div className="text-xs">{error}</div>
            </div>
          )}
        </div>

        <aside className="bg-[#071522] p-4 rounded border border-[#0b1620]">
          <h3 className="text-sm font-medium mb-2">Workspace</h3>
          <div className="text-sm text-[#9aa7b7]">Generated project files will be created in the server workspace. Check logs for details.</div>
        </aside>
      </div>
    </div>
  )
}
