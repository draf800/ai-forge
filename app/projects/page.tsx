export default function ProjectsPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[#9aa7b7]">Manage your projects</div>
        <button className="px-3 py-2 bg-[#7c3aed] rounded">Create project</button>
      </div>

      <div className="grid gap-3">
        <div className="p-4 bg-[#071522] rounded border border-[#0b1620]">No projects yet. Create your first project.</div>
      </div>
    </div>
  )
}
