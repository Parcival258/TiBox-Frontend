import { describe, expect, it } from 'vitest'
import { VIEW_PATHS, viewFromPath } from './routes'

describe('application routes', () => {
  it('maps every workspace path back to its view', () => {
    for (const [view, path] of Object.entries(VIEW_PATHS)) {
      expect(viewFromPath(path)).toBe(view)
    }
  })

  it('accepts a trailing slash and rejects unknown paths', () => {
    expect(viewFromPath('/inventario/')).toBe('inventory')
    expect(viewFromPath('/ruta-desconocida')).toBeNull()
  })
})
