import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { createProject } from '../lib/workspace/projects'
import { createFile, readFile, updateFile, deleteFile, listFiles } from '../lib/workspace/fileManager'

let tmpRoot = ''
let originalWorkspacesRoot = process.env.WORKSPACES_ROOT

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-forge-test-'))
  process.env.WORKSPACES_ROOT = tmpRoot
})

afterEach(async () => {
  // cleanup
  try { await fs.rm(tmpRoot, { recursive: true, force: true }) } catch (e) {}
  process.env.WORKSPACES_ROOT = originalWorkspacesRoot
})

describe('fileManager security and operations', () => {
  it('rejects path traversal in createFile', async () => {
    const proj = await createProject('test')
    await expect(createFile(proj.id, '../outside.txt', 'hi')).rejects.toThrow()
  })

  it('rejects absolute path', async () => {
    const proj = await createProject('test2')
    const abs = path.isAbsolute('/') ? '/' : 'C:\\Windows'
    await expect(createFile(proj.id, abs, 'x')).rejects.toThrow()
  })

  it('creates, reads, updates, and deletes files', async () => {
    const proj = await createProject('test3')
    await createFile(proj.id, 'src/index.txt', 'hello')
    const read = await readFile(proj.id, 'src/index.txt')
    expect(read).toBe('hello')

    await updateFile(proj.id, 'src/index.txt', 'world')
    const read2 = await readFile(proj.id, 'src/index.txt')
    expect(read2).toBe('world')

    const files = await listFiles(proj.id)
    expect(files).toContain('src/index.txt')

    await deleteFile(proj.id, 'src/index.txt')
    await expect(readFile(proj.id, 'src/index.txt')).rejects.toThrow()
  })

  it('handles non-existent project', async () => {
    await expect(listFiles('no-such-project')).resolves.toEqual([])
    await expect(readFile('no-such-project', 'x')).rejects.toThrow()
  })
})
