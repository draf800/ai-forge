export default function AgentsPage() {
  const agents = [
    'Planner','Coder','Debugger','Tester','Researcher','Database','API','UI','Deployment'
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Agents</h2>
      <div className="grid grid-cols-3 gap-4">
        {agents.map(a => (
          <div key={a} className="p-4 bg-[#071522] rounded border border-[#0b1620]">
            <div className="font-medium mb-1">{a}</div>
            <div className="text-sm text-[#9aa7b7]">Agent role: {a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
