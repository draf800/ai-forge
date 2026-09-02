import path from 'path'
import fs from 'fs/promises'
import { getWorkspaceRoot } from './index'

export async function listProjects() {
  const WORKSPACES_ROOT = getWorkspaceRoot()
  try {
    const entries = await fs.readdir(WORKSPACES_ROOT, { withFileTypes: true })
    const projects: { id: string; name?: string }[] = []
    for (const e of entries) {
      if (e.isDirectory()) {
        const id = e.name
        let name = undefined
        try {
          const meta = await fs.readFile(path.join(WORKSPACES_ROOT, id, 'project.json'), 'utf-8')
          const obj = JSON.parse(meta)
          name = obj.name
        } catch (err) {
          // ignore
        }
        projects.push({ id, name })
      }
    }
    return projects
  } catch (err) {
    return []
  }
}
