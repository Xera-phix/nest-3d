export type ViewMode = 'room' | 'plan'

export type TransformMode = 'select' | 'move' | 'rotate'

export type FurnitureKind =
  | 'bed'
  | 'rug'
  | 'desk'
  | 'chair'
  | 'bookcase'
  | 'lounge'
  | 'side-table'
  | 'floor-lamp'
  | 'plant'

export interface Position2D {
  x: number
  z: number
}

export interface FurnitureItem {
  id: string
  kind: FurnitureKind
  label: string
  position: Position2D
  rotation: number
  footprint: {
    width: number
    depth: number
  }
  scale: number
  collidable?: boolean
}

export interface EditorStatus {
  tone: 'info' | 'success' | 'warning' | 'error'
  message: string
}