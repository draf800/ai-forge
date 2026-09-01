export default function FilesPage() {
  const files = [
    'package.json','tsconfig.json','app/layout.tsx','app/builder/page.tsx'
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Files</h2>
      <div className="p-4 bg-[#071522] rounded border border-[#0b1620]">
        <div className="text-sm text-[#9aa7b7] mb-3">Project file explorer</div>
        <ul className="space-y-1 text-sm">
          {files.map(f => <li key={f} className="px-2 py-1 hover:bg-[#0f1724] rounded">{f}</li>)}
        </ul>
      </div>
    </div>
  )
}
