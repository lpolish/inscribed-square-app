export interface Point {
  x: number
  y: number
}

export interface Square {
  points: Point[]
  type: 'inscribed' | 'extended'
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

