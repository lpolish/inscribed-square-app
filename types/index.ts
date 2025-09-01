export interface Point {
  x: number
  y: number
}

export interface Square {
  points: Point[]
  type: 'inscribed' | 'extended' | 'true-inscribed' | 'max-inscribed'
  rotation?: number // rotation angle in radians for rotated squares
  center?: Point // center point for rotated squares
  size?: number // side length for rotated squares
}

export interface CurveData {
  length: number
  area: number
  centroid: Point
  boundingBox: {
    min: Point
    max: Point
  }
}

