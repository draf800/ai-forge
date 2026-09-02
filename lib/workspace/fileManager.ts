import path from 'path'
import fs from 'fs/promises'
import { projectRootPath } from './index'
import { isPathUnsafe } from '../utils/json'

function resolvePath(projectId: string, rel: string) {
  if (isPathUnsafe(rel)) throw new Error('Invalid path')
  const root = projectRootPath(projectId)
  const resolved = path.resolve(root, rel)
  if (!resolved.startsWith(path.resolve(root))) throw new Error('Path escapes workspace')
  return resolved
}

export async function listFiles(projectId: string) {
  const root = projectRootPath(projectId)
  async function walk(dir: string, base = ''): Promise<string[]> {
    let entries: any[]
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch (err) {
      return []
    }
    const results: string[] = []
    for (const e of entries) {
      const rel = base ? path.join(base, e.name) : e.name
      if (e.isDirectory()) {
        const sub = await walk(path.join(dir, e.name), rel)
        results.push(...sub)
      } else if (e.isFile()) {
        results.push(rel)
      }
    }
    return results
  }
  try {
    return await walk(root)
  } catch (err) {
    return []
  }
}

export async function readFile(projectId: string, relPath: string) {
  const resolved = resolvePath(projectId, relPath)
  return await fs.readFile(resolved, 'utf-8')
}

export async function createFile(projectId: string, relPath: string, content: string) {
  const resolved = resolvePath(projectId, relPath)
  await fs.mkdir(path.dirname(resolved), { recursive: true })
  await fs.writeFile(resolved, content, { flag: 'wx' })
}

export async function updateFile(projectId: string, relPath: string, content: string) {
  const resolved = resolvePath(projectId, relPath)
  await fs.mkdir(path.dirname(resolved), { recursive: true })
  await fs.writeFile(resolved, content, { flag: 'w' })
}

export async function deleteFile(projectId: string, relPath: string) {
  const resolved = resolvePath(projectId, relPath)
  await fs.unlink(resolved)
}
