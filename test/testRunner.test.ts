import { describe, it, expect } from 'vitest'
import { isActionAllowed, ALLOWED } from '../lib/test/runner'

describe('test runner allowlist', () => {
  it('only allows mapped actions', () => {
    expect(isActionAllowed('install')).toBe(true)
    expect(isActionAllowed('lint')).toBe(true)
    expect(isActionAllowed('type-check')).toBe(true)
    expect(isActionAllowed('build')).toBe(true)
    expect(isActionAllowed('rm -rf /')).toBe(false)
  })

  it('ALLOWED mapping contains expected entries', () => {
    expect((ALLOWED as any).install).toBeDefined()
    expect((ALLOWED as any)['type-check']).toBeDefined()
  })
})
