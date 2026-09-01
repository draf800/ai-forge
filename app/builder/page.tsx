'use client'
import { useState } from 'react'

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('Idle')
  const [logs, setLogs] = useState<string[]>([])

  function startBuild() {
    setStatus('Building')
    setLogs(prev => [...prev, `Build started at ${new Date().toLocaleTimeString()}`])
    // Placeholder: no real build functionality yet
    setTimeout(() => {
      setStatus('Ready')
      setLogs(prev => [...prev, `Build completed at ${new Date().toLocaleTimeString()}`])
    }, 1200)
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
            <div className="text-sm text-[#9aa7b7]">Status: <span className="font-medium text-white">{status}</span></div>
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
        </div>

        <aside className="bg-[#071522] p-4 rounded border border-[#0b1620]">
          <h3 className="text-sm font-medium mb-2">Workspace</h3>
          <div className="text-sm text-[#9aa7b7]">Your workspace will show generated files and status. This is a placeholder for now.</div>
        </aside>
      </div>
    </div>
  )
}
