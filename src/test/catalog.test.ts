import { describe, expect, it } from 'vitest'
import {
  INITIAL_FURNITURE,
  validateFurnitureCatalog,
} from '../domain/catalog'

describe('furniture catalog', () => {
  it('contains nine unique, in-bounds, nonoverlapping pieces', () => {
    expect(INITIAL_FURNITURE).toHaveLength(9)
    expect(validateFurnitureCatalog(INITIAL_FURNITURE)).toEqual([])
  })

  it('reports duplicate ids, room overflow, and collisions', () => {
    const first = {
      ...INITIAL_FURNITURE[0],
      id: 'duplicate',
      position: { x: 20, z: 20 },
    }
    const second = {
      ...INITIAL_FURNITURE[2],
      id: 'duplicate',
      position: { x: 20, z: 20 },
    }

    expect(validateFurnitureCatalog([first, second])).toEqual([
      'Duplicate furniture id: duplicate',
      'Furniture outside room: duplicate',
      'Furniture outside room: duplicate',
      'Overlapping furniture: duplicate',
    ])
  })
})