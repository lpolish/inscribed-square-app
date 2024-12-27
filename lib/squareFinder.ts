import { Point } from '../types'

function isPointInside(point: Point, curve: Point[]): boolean {
  let inside = false
  for (let i = 0, j = curve.length - 1; i < curve.length; j = i++) {
    const xi = curve[i].x, yi = curve[i].y
    const xj = curve[j].x, yj = curve[j].y
    const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function getRandomPoint(minX: number, maxX: number, minY: number, maxY: number): Point {
  return {
    x: Math.random() * (maxX - minX) + minX,
    y: Math.random() * (maxY - minY) + minY
  }
}

export function findInscribedSquare(curve: Point[]): Point[] {
  const minX = Math.min(...curve.map(p => p.x))
  const maxX = Math.max(...curve.map(p => p.x))
  const minY = Math.min(...curve.map(p => p.y))
  const maxY = Math.max(...curve.map(p => p.y))

  let bestSquare: Point[] = []
  let maxSize = 0

  for (let i = 0; i < 1000; i++) {
    const center = getRandomPoint(minX, maxX, minY, maxY)
    if (!isPointInside(center, curve)) continue

    let low = 0
    let high = Math.min(maxX - minX, maxY - minY)

    while (high - low > 1) {
      const mid = (low + high) / 2
      const square = [
        { x: center.x - mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y - mid / 2 },
        { x: center.x + mid / 2, y: center.y + mid / 2 },
        { x: center.x - mid / 2, y: center.y + mid / 2 },
      ]

      if (square.every(p => isPointInside(p, curve))) {
        if (mid > maxSize) {
          maxSize = mid
          bestSquare = square
        }
        low = mid
      } else {
        high = mid
      }
    }
  }

  return bestSquare
}

export function findExtendedSquare(curve: Point[]): Point[] {
  const minX = Math.min(...curve.map(p => p.x))
  const maxX = Math.max(...curve.map(p => p.x))
  const minY = Math.min(...curve.map(p => p.y))
  const maxY = Math.max(...curve.map(p => p.y))

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const size = Math.max(maxX - minX, maxY - minY)

  return [
    { x: centerX - size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY - size / 2 },
    { x: centerX + size / 2, y: centerY + size / 2 },
    { x: centerX - size / 2, y: centerY + size / 2 },
  ]
}

