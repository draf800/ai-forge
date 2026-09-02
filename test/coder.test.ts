import { describe, it, expect } from 'vitest'
import { CoderResponse } from '../lib/agents/coder'

describe('coder schema validation', () => {
  it('accepts valid operations', () => {
    const ok = { operations: [ { type: 'create', path: 'a.txt', content: 'hi' } ] }
    const parsed = CoderResponse.safeParse(ok)
    expect(parsed.success).toBe(true)
  })

  it('rejects invalid operations', () => {
    const bad = { operations: [ { type: 'exec', path: 'a.txt' } ] }
    const parsed = CoderResponse.safeParse(bad as any)
    expect(parsed.success).toBe(false)
  })
})
