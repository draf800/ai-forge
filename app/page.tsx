import './globals.css'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome to AI Forge</h1>
      </header>

      <section className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-[#071722] rounded border border-[#0b1620]"> 
          <h2 className="text-lg font-medium mb-2">Quickstart</h2>
          <p className="text-sm text-[#9aa7b7] mb-4">Open the Builder to compose a natural-language prompt and build your app.</p>
          <Link href="/builder"><a className="inline-block px-4 py-2 bg-[#7c3aed] rounded text-white">Open Builder</a></Link>
        </div>

        <div className="p-6 bg-[#071722] rounded border border-[#0b1620]"> 
          <h2 className="text-lg font-medium mb-2">Recent Projects</h2>
          <p className="text-sm text-[#9aa7b7]">No projects yet. Create one in Projects.</p>
        </div>
      </section>
    </div>
  )
}
