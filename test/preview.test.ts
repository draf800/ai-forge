import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { createProject } from '../lib/workspace/projects'
import { startPreview, stopPreview, getPreviewStatus, isValidProjectId } from '../lib/preview/manager'

let tmpRoot = ''
let originalWorkspacesRoot = process.env.WORKSPACES_ROOT

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-forge-test-'))
  process.env.WORKSPACES_ROOT = tmpRoot
})

afterEach(async () => {
  try { await fs.rm(tmpRoot, { recursive: true, force: true }) } catch (e) {}
  process.env.WORKSPACES_ROOT = originalWorkspacesRoot
})

describe('preview manager', () => {
  it('valid project starts', async () => {
    const proj = await createProject('pvtest')
    // overwrite package.json dev script to be a node process
    const pkgPath = path.join(proj.root, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    pkg.scripts.dev = "node -e \"console.log('dev'); setInterval(()=>{},1000)\""
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))

    const info = await startPreview(proj.id)
    expect(info.port).toBeGreaterThanOrEqual(4000)
    const status = getPreviewStatus(proj.id)
    expect(status).not.toBeNull()

    await stopPreview(proj.id)
    const status2 = getPreviewStatus(proj.id)
    expect(status2).toBeNull()
  })

  it('nonexistent project rejected', async () => {
    await expect(startPreview('no-such-proj')).rejects.toThrow()
  })

  it('traversal rejected', async () => {
    expect(isValidProjectId('../etc')).toBe(false)
    await expect(startPreview('../etc')).rejects.toThrow()
  })

  it('absolute path rejected', async () => {
    expect(isValidProjectId('/etc/passwd')).toBe(false)
    await expect(startPreview('/etcpasswd')).rejects.toThrow()
  })

  it('duplicate preview rejected', async () => {
    const proj = await createProject('pvdup')
    const pkgPath = path.join(proj.root, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    pkg.scripts.dev = "node -e \"console.log('dev'); setInterval(()=>{},1000)\""
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))

    const one = await startPreview(proj.id)
    await expect(startPreview(proj.id)).rejects.toThrow()
    await stopPreview(proj.id)
  })

  it('exited process releases state/port', async () => {
    const proj = await createProject('pvexit')
    const pkgPath = path.join(proj.root, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
    // short-lived process
    pkg.scripts.dev = "node -e \"console.log('done'); process.exit(0)\""
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))

    const info = await startPreview(proj.id)
    // wait a bit for process to exit and cleanup
    await new Promise(r => setTimeout(r, 500))
    const status = getPreviewStatus(proj.id)
    expect(status).toBeNull()
    // port should be free; starting again should work
    const info2 = await startPreview(proj.id)
    await stopPreview(proj.id)
  })
})
