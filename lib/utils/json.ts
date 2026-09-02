import path from 'path'

export function isPathUnsafe(rel: string) {
  // Reject absolute paths
  if (path.isAbsolute(rel)) return true

  // Normalize to remove redundant separators and resolve .. segments
  const normalized = path.normalize(rel)

  // Split into segments and look for parent dir references
  const segs = normalized.split(path.sep)
  if (segs.includes('..')) return true

  // Also reject paths that start with separator after normalization
  if (normalized.startsWith('..' + path.sep) || normalized === '..') return true

  return false
}

// Extract a JSON object or array from free text safely.
export function extractJson(text: string): any | null {
  if (!text) return null
  // Quick try: pure JSON
  try {
    return JSON.parse(text)
  } catch (e) {
    // continue
  }

  // Remove Markdown fences and try to find the first JSON-like block
  const fenceMatch = /```(?:json)?\n([\s\S]*?)\n```/i.exec(text)
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1])
    } catch (e) {
      // continue
    }
  }

  // Try to find first balanced {...} or [...]
  const start = text.search(/[\{\[]/)
  if (start === -1) return null
  const openChar = text[start]
  const closeChar = openChar === '{' ? '}' : ']'
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === openChar) depth++
    else if (ch === closeChar) depth--
    if (depth === 0) {
      const candidate = text.slice(start, i + 1)
      try {
        return JSON.parse(candidate)
      } catch (e) {
        return null
      }
    }
  }

  return null
}
