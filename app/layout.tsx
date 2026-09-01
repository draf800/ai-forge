export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head />
      <body className="h-full">
        <div className="min-h-screen flex">
          <aside className="w-72 bg-[#071422] border-r border-[#0b1620] p-4">
            <div className="mb-6 text-white text-2xl font-semibold">AI Forge</div>
            <nav className="space-y-1 text-sm text-[#c7d2da]">
              <a href="/builder" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Builder</a>
              <a href="/projects" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Projects</a>
              <a href="/agents" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Agents</a>
              <a href="/files" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Files</a>
              <a href="/preview" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Preview</a>
              <a href="/deployments" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Deployments</a>
              <a href="/settings" className="block px-3 py-2 rounded hover:bg-[#0f1724]">Settings</a>
            </nav>
            <div className="mt-6 text-xs text-[#94a3b8]">Developer Mode • Dark</div>
          </aside>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
