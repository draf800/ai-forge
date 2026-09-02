'use client'
import { useState, useEffect } from 'react'

export default function PreviewPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const res = await fetch('/api/projects/list')
    const j = await res.json()
    if (j?.ok) setProjects(j.data)
  }

  async function start() {
    if (!selected) return
    const res = await fetch('/api/preview/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: selected }) })
    const j = await res.json()
    if (j?.ok) {
      setStatus({ port: j.data.port })
      pollStatus()
    } else {
      alert('Start failed: ' + (j?.error || ''))
    }
  }

  async function stop() {
    if (!selected) return
    const res = await fetch('/api/preview/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: selected }) })
    const j = await res.json()
    if (j?.ok) setStatus(null)
    else alert('Stop failed: ' + (j?.error || ''))
  }

  async function pollStatus() {
    if (!selected) return
    const res = await fetch(`/api/preview/status?projectId=${selected}`)
    const j = await res.json()
    if (j?.ok) {
      setStatus(j.data)
      setLogs(j.data.logs || [])
      setTimeout(pollStatus, 2000)
    } else {
      setStatus(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
      <div className="mb-4">
        <label className="text-sm mr-2">Project</label>
        <select value={selected ?? ''} onChange={e => setSelected(e.target.value)} className="bg-[#071522] p-2 rounded">
          <option value="">Select a project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <button onClick={start} className="ml-3 px-3 py-2 bg-[#7c3aed] rounded">Start Preview</button>
        <button onClick={stop} className="ml-2 px-3 py-2 bg-[#374151] rounded">Stop</button>
      </div>

      {status && (
        <div className="mb-4">
          <div className="text-sm text-[#9aa7b7]">Preview running on port {status.port}</div>
          <div className="mt-2">
            <iframe src={`/api/preview/proxy/${selected}`} className="w-full h-96 border" />
          </div>
        </div>
      )}

      <div className="bg-[#071522] p-3 rounded border border-[#0b1620]">
        <h3 className="text-sm font-medium mb-2">Logs</h3>
        <pre className="text-xs text-[#9aa7b7] max-h-48 overflow-auto">{logs.join('\n')}</pre>
      </div>
    </div>
  )
}
