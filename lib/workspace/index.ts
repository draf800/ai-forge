import path from 'path'
import fs from 'fs/promises'

export type Project = {
  id: string
  name: string
  description?: string
  status: 'idle' | 'building' | 'error' | 'ready'
  root: string
  createdAt: string
  updatedAt: string
}

const WORKSPACES_ROOT = process.env.WORKSPACES_ROOT || path.resolve(process.cwd(), 'workspaces')

export async function ensureWorkspacesRoot() {
  try {
    await fs.mkdir(WORKSPACES_ROOT, { recursive: true })
  } catch (err) {
    // ignore
  }
}

export function getWorkspaceRoot() {
  return WORKSPACES_ROOT
}

export function projectRootPath(projectId: string) {
  return path.join(WORKSPACES_ROOT, projectId)
}

export async function projectExists(projectId: string) {
  const root = projectRootPath(projectId)
  try {
    const stat = await fs.stat(root)
    return stat.isDirectory()
  } catch (err) {
    return false
  }
}

export async function loadProject(projectId: string): Promise<Project | null> {
  const root = projectRootPath(projectId)
  try {
    const metaPath = path.join(root, 'project.json')
    const buf = await fs.readFile(metaPath, 'utf-8')
    const obj = JSON.parse(buf)
    return obj as Project
  } catch (err) {
    return null
  }
}
