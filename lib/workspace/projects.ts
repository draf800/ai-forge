import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'
import { ensureWorkspacesRoot, projectRootPath } from './index'

export async function createProject(name: string, description?: string) {
  await ensureWorkspacesRoot()
  const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(8).toString('hex')
  const root = projectRootPath(id)
  await fs.mkdir(root, { recursive: true })

  const createdAt = new Date().toISOString()
  const project = {
    id,
    name,
    description: description || '',
    status: 'idle',
    root,
    createdAt,
    updatedAt: createdAt
  }

  // initialize a minimal Next.js project scaffold (safe, minimal)
  const pkg = {
    name: name.toLowerCase().replace(/[^a-z0-9\-]/g, '-') || 'ai-forge-app',
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      'type-check': 'tsc --noEmit'
    }
  }

  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2))
  await fs.writeFile(path.join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022' } }, null, 2))

  // minimal app directory
  const appDir = path.join(root, 'app')
  await fs.mkdir(appDir, { recursive: true })
  const page = `export default function Home() {\n  return <div>Hello from generated app: ${name}</div>\n}`
  await fs.writeFile(path.join(appDir, 'page.tsx'), page)

  // write project metadata
  await fs.writeFile(path.join(root, 'project.json'), JSON.stringify(project, null, 2))

  return project
}
