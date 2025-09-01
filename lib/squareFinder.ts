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

// Helper function to find the closest point on the curve to a given point
function findClosestPointOnCurve(point: Point, curve: Point[]): Point {
  let minDistance = Infinity
  let closestPoint = curve[0]
  
  for (let i = 0; i < curve.length; i++) {
    const j = (i + 1) % curve.length
    const linePoint = closestPointOnLineSegment(point, curve[i], curve[j])
    const distance = distanceSquared(point, linePoint)
    
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = linePoint
    }
  }
  
  return closestPoint
}

// Helper function to find closest point on a line segment
function closestPointOnLineSegment(point: Point, lineStart: Point, lineEnd: Point): Point {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  
  if (dx === 0 && dy === 0) {
    return lineStart
  }
  
  const t = Math.max(0, Math.min(1, 
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)
  ))
  
  return {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy
  }
}

// Helper function to calculate squared distance between two points
function distanceSquared(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return dx * dx + dy * dy
}

// Generate rotated square points given center, size, and rotation
function generateRotatedSquare(center: Point, size: number, rotation: number = 0): Point[] {
  const halfSize = size / 2
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  
  // Define square corners relative to center
  const corners = [
    { x: -halfSize, y: -halfSize },
    { x: halfSize, y: -halfSize },
    { x: halfSize, y: halfSize },
    { x: -halfSize, y: halfSize }
  ]
  
  // Rotate and translate corners
  return corners.map(corner => ({
    x: center.x + corner.x * cos - corner.y * sin,
    y: center.y + corner.x * sin + corner.y * cos
  }))
}

// Renamed from findInscribedSquare to be more specific
export function findMaxInscribedSquare(curve: Point[]): Point[] {
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

// Keep the old function name for backward compatibility
export function findInscribedSquare(curve: Point[]): Point[] {
  return findMaxInscribedSquare(curve)
}

// New function to find true inscribed square with vertices on curve boundary
export function findTrueInscribedSquare(curve: Point[], allowRotation: boolean = false, iterations: number = 5000): { 
  points: Point[], 
  center: Point, 
  size: number, 
  rotation: number 
} | null {
  if (curve.length < 4) return null
  
  const minX = Math.min(...curve.map(p => p.x))
  const maxX = Math.max(...curve.map(p => p.x))
  const minY = Math.min(...curve.map(p => p.y))
  const maxY = Math.max(...curve.map(p => p.y))
  
  let bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  for (let i = 0; i < iterations; i++) {
    // Try random center point inside the curve
    const center = getRandomPoint(minX, maxX, minY, maxY)
    if (!isPointInside(center, curve)) continue
    
    // Try different rotations if allowed
    const rotations = allowRotation ? 
      Array.from({ length: 36 }, (_, i) => i * Math.PI / 18) : // 0 to 180 degrees in 5-degree steps
      [0] // Just axis-aligned
    
    for (const rotation of rotations) {
      // Binary search for the largest square size where all vertices are on or near the curve
      let low = 0
      let high = Math.min(maxX - minX, maxY - minY)
      let bestSize = 0
      
      while (high - low > 2) {
        const mid = (low + high) / 2
        const squarePoints = generateRotatedSquare(center, mid, rotation)
        
        // Check if all vertices can be projected onto the curve boundary
        const projectedVertices = squarePoints.map(vertex => 
          findClosestPointOnCurve(vertex, curve)
        )
        
        // Calculate how close the projected vertices are to forming a square
        const isValidSquare = validateProjectedSquare(projectedVertices, mid * 0.9) // Allow 10% tolerance
        
        if (isValidSquare) {
          bestSize = mid
          low = mid
        } else {
          high = mid
        }
      }
      
      if (bestSize > 0) {
        const finalSquarePoints = generateRotatedSquare(center, bestSize, rotation)
        const projectedVertices = finalSquarePoints.map(vertex => 
          findClosestPointOnCurve(vertex, curve)
        )
        
        const area = bestSize * bestSize
        if (area > maxArea) {
          maxArea = area
          bestSquare = {
            points: projectedVertices,
            center,
            size: bestSize,
            rotation
          }
        }
      }
    }
  }
  
  return bestSquare
}

// Helper function to validate if projected points form a reasonable square
function validateProjectedSquare(points: Point[], expectedSize: number): boolean {
  if (points.length !== 4) return false
  
  // Check if the points form roughly a square shape
  const distances = []
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    const dist = Math.sqrt(distanceSquared(points[i], points[j]))
    distances.push(dist)
  }
  
  // Check if all sides are roughly equal
  const avgSideLength = distances.reduce((sum, d) => sum + d, 0) / 4
  const tolerance = expectedSize * 0.3 // 30% tolerance
  
  return distances.every(dist => Math.abs(dist - avgSideLength) < tolerance)
}

// Progressive improvement function
export function findTrueInscribedSquareProgressive(
  curve: Point[], 
  allowRotation: boolean = false,
  onProgress?: (bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null, iteration: number) => void
): Promise<{ points: Point[], center: Point, size: number, rotation: number } | null> {
  return new Promise((resolve) => {
    let bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null = null
    let iteration = 0
    const maxIterations = 10000
    const batchSize = 100
    
    const processNextBatch = () => {
      for (let i = 0; i < batchSize && iteration < maxIterations; i++, iteration++) {
        const result = findTrueInscribedSquare(curve, allowRotation, 1)
        if (result && (!bestSquare || result.size > bestSquare.size)) {
          bestSquare = result
        }
      }
      
      if (onProgress) {
        onProgress(bestSquare, iteration)
      }
      
      if (iteration < maxIterations) {
        setTimeout(processNextBatch, 0) // Allow UI to update
      } else {
        resolve(bestSquare)
      }
    }
    
    processNextBatch()
  })
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

