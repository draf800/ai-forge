export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-[#071522] rounded border border-[#0b1620]">
          <h3 className="font-medium mb-2">AI Provider</h3>
          <div className="text-sm text-[#9aa7b7] mb-2">Provider: <strong>Not configured</strong></div>
          <div className="text-sm text-[#9aa7b7]">Model: <strong>not set</strong></div>
        </div>

        <div className="p-4 bg-[#071522] rounded border border-[#0b1620]">
          <h3 className="font-medium mb-2">Environment</h3>
          <div className="text-sm text-[#9aa7b7]">NODE_ENV: production</div>
          <div className="text-sm text-[#9aa7b7]">No secrets stored. Configure your provider in secure storage.</div>
        </div>
      </div>
    </div>
  )
}
