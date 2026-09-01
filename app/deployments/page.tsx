export default function DeploymentsPage() {
  const deployments = [
    {id: 'staging', status: 'Idle'},
    {id: 'production', status: 'Idle'}
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Deployments</h2>
      <div className="grid gap-3">
        {deployments.map(d => (
          <div key={d.id} className="p-4 bg-[#071522] rounded border border-[#0b1620]">
            <div className="flex items-center justify-between">
              <div className="font-medium">{d.id}</div>
              <div className="text-sm text-[#9aa7b7]">{d.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
