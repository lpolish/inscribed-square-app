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

// Preprocess curve to extract geometric properties
function preprocessCurve(curve: Point[]): {
  parametricPoints: { point: Point, t: number }[],
  centroid: Point,
  avgRadius: number,
  boundingBox: { minX: number, maxX: number, minY: number, maxY: number }
} {
  // Calculate parametric representation
  const parametricPoints: { point: Point, t: number }[] = []
  let totalLength = 0
  
  for (let i = 0; i < curve.length; i++) {
    const next = (i + 1) % curve.length
    const segmentLength = Math.sqrt(distanceSquared(curve[i], curve[next]))
    totalLength += segmentLength
  }
  
  let currentLength = 0
  for (let i = 0; i < curve.length; i++) {
    const next = (i + 1) % curve.length
    const segmentLength = Math.sqrt(distanceSquared(curve[i], curve[next]))
    parametricPoints.push({
      point: curve[i],
      t: currentLength / totalLength
    })
    currentLength += segmentLength
  }
  
  // Calculate centroid
  const centroid = {
    x: curve.reduce((sum, p) => sum + p.x, 0) / curve.length,
    y: curve.reduce((sum, p) => sum + p.y, 0) / curve.length
  }
  
  // Calculate average radius from centroid
  const avgRadius = curve.reduce((sum, p) => sum + Math.sqrt(distanceSquared(p, centroid)), 0) / curve.length
  
  // Bounding box
  const boundingBox = {
    minX: Math.min(...curve.map(p => p.x)),
    maxX: Math.max(...curve.map(p => p.x)),
    minY: Math.min(...curve.map(p => p.y)),
    maxY: Math.max(...curve.map(p => p.y))
  }
  
  return { parametricPoints, centroid, avgRadius, boundingBox }
}

// Strategy 1: Parametric curve sampling approach
function parametricCurveSearch(
  curve: Point[], 
  curveInfo: ReturnType<typeof preprocessCurve>,
  allowRotation: boolean,
  iterations: number
): { points: Point[], center: Point, size: number, rotation: number } | null {
  let bestResult: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  const rotations = allowRotation ? 
    Array.from({ length: 72 }, (_, i) => i * Math.PI / 36) : // 0 to 180 degrees in 2.5-degree steps
    [0] // Just axis-aligned
  
  for (let i = 0; i < iterations; i++) {
    // Sample a point on the curve parametrically
    const t1 = Math.random()
    const basePoint = interpolateOnCurve(curveInfo.parametricPoints, t1)
    
    for (const rotation of rotations) {
      // Try different square sizes
      const maxSize = Math.min(curveInfo.boundingBox.maxX - curveInfo.boundingBox.minX, 
                              curveInfo.boundingBox.maxY - curveInfo.boundingBox.minY) * 0.8
      
      for (let sizeRatio = 0.1; sizeRatio <= 1.0; sizeRatio += 0.05) {
        const size = maxSize * sizeRatio
        
        // Try placing one vertex at the sampled point and construct square
        const square = constructSquareFromVertex(basePoint, size, rotation)
        if (!square) continue
        
        // Project all vertices to curve
        const projectedVertices = square.map(vertex => findClosestPointOnCurve(vertex, curve))
        
        // Validate the resulting square
        if (validateInscribedSquare(projectedVertices, size)) {
          const area = calculateSquareArea(projectedVertices)
          if (area > maxArea) {
            maxArea = area
            const center = calculateSquareCenter(projectedVertices)
            bestResult = {
              points: projectedVertices,
              center,
              size: Math.sqrt(area),
              rotation
            }
          }
        }
      }
    }
  }
  
  return bestResult
}

// Strategy 2: Optimized center-based search
function optimizedCenterSearch(
  curve: Point[], 
  curveInfo: ReturnType<typeof preprocessCurve>,
  allowRotation: boolean,
  iterations: number
): { points: Point[], center: Point, size: number, rotation: number } | null {
  let bestResult: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  for (let i = 0; i < iterations; i++) {
    // Use gradient-based optimization starting from promising centers
    const center = i < iterations * 0.3 ? 
      curveInfo.centroid : // Start with centroid for first 30% of attempts
      getRandomPoint(curveInfo.boundingBox.minX, curveInfo.boundingBox.maxX, 
                    curveInfo.boundingBox.minY, curveInfo.boundingBox.maxY)
    
    if (!isPointInside(center, curve)) continue
    
    const rotations = allowRotation ? 
      Array.from({ length: 36 }, (_, i) => i * Math.PI / 18) : 
      [0]
    
    for (const rotation of rotations) {
      // Binary search with tighter bounds
      let low = 0
      let high = curveInfo.avgRadius * 1.5 // More realistic upper bound
      let bestSize = 0
      
      while (high - low > 1) {
        const mid = (low + high) / 2
        const squarePoints = generateRotatedSquare(center, mid, rotation)
        
        // Check if square can be inscribed
        const projectedVertices = squarePoints.map(vertex => 
          findClosestPointOnCurve(vertex, curve))
        
        if (validateInscribedSquare(projectedVertices, mid)) {
          bestSize = mid
          low = mid
        } else {
          high = mid
        }
      }
      
      if (bestSize > 0) {
        const finalSquarePoints = generateRotatedSquare(center, bestSize, rotation)
        const projectedVertices = finalSquarePoints.map(vertex => 
          findClosestPointOnCurve(vertex, curve))
        
        const area = calculateSquareArea(projectedVertices)
        if (area > maxArea) {
          maxArea = area
          bestResult = {
            points: projectedVertices,
            center,
            size: bestSize,
            rotation
          }
        }
      }
    }
  }
  
  return bestResult
}

// Strategy 3: Geometric constraint-based search
function geometricConstraintSearch(
  curve: Point[], 
  curveInfo: ReturnType<typeof preprocessCurve>,
  allowRotation: boolean,
  iterations: number
): { points: Point[], center: Point, size: number, rotation: number } | null {
  let bestResult: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  // This strategy focuses on finding squares where geometric constraints are naturally satisfied
  for (let i = 0; i < iterations; i++) {
    // Sample two points on the curve that could form adjacent vertices of a square
    const t1 = Math.random()
    const t2 = (t1 + 0.25 + Math.random() * 0.5) % 1.0 // Sample roughly quarter way around
    
    const p1 = interpolateOnCurve(curveInfo.parametricPoints, t1)
    const p2 = interpolateOnCurve(curveInfo.parametricPoints, t2)
    
    // Try to construct a square with p1 and p2 as adjacent vertices
    const squares = constructSquaresFromTwoPoints(p1, p2)
    
    for (const square of squares) {
      if (!square) continue
      
      // Project remaining vertices to curve
      const projectedSquare = [p1, p2, ...square.slice(2).map(v => findClosestPointOnCurve(v, curve))]
      
      if (validateInscribedSquare(projectedSquare, Math.sqrt(distanceSquared(p1, p2)))) {
        const area = calculateSquareArea(projectedSquare)
        if (area > maxArea) {
          maxArea = area
          const center = calculateSquareCenter(projectedSquare)
          const rotation = Math.atan2(p2.y - p1.y, p2.x - p1.x)
          bestResult = {
            points: projectedSquare,
            center,
            size: Math.sqrt(area),
            rotation
          }
        }
      }
    }
  }
  
  return bestResult
}

// Helper function to interpolate a point on the parametric curve
function interpolateOnCurve(parametricPoints: { point: Point, t: number }[], t: number): Point {
  // Find the segment containing parameter t
  for (let i = 0; i < parametricPoints.length; i++) {
    const current = parametricPoints[i]
    const next = parametricPoints[(i + 1) % parametricPoints.length]
    
    if (t >= current.t && t <= next.t) {
      const localT = (t - current.t) / (next.t - current.t)
      return {
        x: current.point.x + localT * (next.point.x - current.point.x),
        y: current.point.y + localT * (next.point.y - current.point.y)
      }
    }
  }
  
  return parametricPoints[0].point // Fallback
}

// Construct square from one vertex
function constructSquareFromVertex(vertex: Point, size: number, rotation: number): Point[] | null {
  const halfSize = size / 2
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  
  // Place vertex at one corner and construct square
  return [
    vertex,
    { x: vertex.x + size * cos, y: vertex.y + size * sin },
    { x: vertex.x + size * cos - size * sin, y: vertex.y + size * sin + size * cos },
    { x: vertex.x - size * sin, y: vertex.y + size * cos }
  ]
}

// Construct possible squares from two points as adjacent vertices
function constructSquaresFromTwoPoints(p1: Point, p2: Point): (Point[] | null)[] {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  
  // Two possible squares can be formed
  const perpX = -dy
  const perpY = dx
  
  const square1 = [
    p1, p2,
    { x: p2.x + perpX, y: p2.y + perpY },
    { x: p1.x + perpX, y: p1.y + perpY }
  ]
  
  const square2 = [
    p1, p2,
    { x: p2.x - perpX, y: p2.y - perpY },
    { x: p1.x - perpX, y: p1.y - perpY }
  ]
  
  return [square1, square2]
}

// Enhanced validation for inscribed squares
function validateInscribedSquare(points: Point[], expectedSize: number): boolean {
  if (points.length !== 4) return false
  
  // Calculate all distances
  const distances = []
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    distances.push(Math.sqrt(distanceSquared(points[i], points[j])))
  }
  
  // Calculate diagonals
  const diagonal1 = Math.sqrt(distanceSquared(points[0], points[2]))
  const diagonal2 = Math.sqrt(distanceSquared(points[1], points[3]))
  
  // Check side length consistency (tighter tolerance)
  const avgSide = distances.reduce((sum, d) => sum + d, 0) / 4
  const sideTolerance = expectedSize * 0.15 // 15% tolerance
  const sideConsistent = distances.every(d => Math.abs(d - avgSide) < sideTolerance)
  
  // Check diagonal consistency
  const avgDiagonal = (diagonal1 + diagonal2) / 2
  const expectedDiagonal = avgSide * Math.sqrt(2)
  const diagonalTolerance = expectedDiagonal * 0.15
  const diagonalConsistent = Math.abs(avgDiagonal - expectedDiagonal) < diagonalTolerance
  
  // Check if diagonals are approximately equal
  const diagonalEqual = Math.abs(diagonal1 - diagonal2) < diagonalTolerance
  
  return sideConsistent && diagonalConsistent && diagonalEqual
}

// Calculate actual area of a quadrilateral
function calculateSquareArea(points: Point[]): number {
  if (points.length !== 4) return 0
  
  // Use shoelace formula
  let area = 0
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    area += points[i].x * points[j].y - points[j].x * points[i].y
  }
  return Math.abs(area) / 2
}

// Calculate center of square
function calculateSquareCenter(points: Point[]): Point {
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length
  }
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

// Enhanced function to find true inscribed square with vertices on curve boundary
export function findTrueInscribedSquare(curve: Point[], allowRotation: boolean = false, iterations: number = 5000): { 
  points: Point[], 
  center: Point, 
  size: number, 
  rotation: number 
} | null {
  if (curve.length < 4) return null
  
  // Preprocess curve for better analysis
  const curveInfo = preprocessCurve(curve)
  
  let bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  // Use multiple search strategies for comprehensive exploration
  const strategies = [
    () => parametricCurveSearch(curve, curveInfo, allowRotation, iterations * 0.4),
    () => optimizedCenterSearch(curve, curveInfo, allowRotation, iterations * 0.3),
    () => geometricConstraintSearch(curve, curveInfo, allowRotation, iterations * 0.3)
  ]
  
  for (const strategy of strategies) {
    const result = strategy()
    if (result && result.size * result.size > maxArea) {
      maxArea = result.size * result.size
      bestSquare = result
    }
  }
  
  return bestSquare
}

// Helper function to validate if projected points form a reasonable square (legacy compatibility)
function validateProjectedSquare(points: Point[], expectedSize: number): boolean {
  return validateInscribedSquare(points, expectedSize)
}

// Progressive improvement function with enhanced algorithm
export function findTrueInscribedSquareProgressive(
  curve: Point[], 
  allowRotation: boolean = false,
  onProgress?: (bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null, iteration: number) => void
): Promise<{ points: Point[], center: Point, size: number, rotation: number } | null> {
  return new Promise((resolve) => {
    let bestSquare: { points: Point[], center: Point, size: number, rotation: number } | null = null
    let iteration = 0
    const maxIterations = 15000 // Increased for better results
    const batchSize = 200 // Larger batches for efficiency
    
    const processNextBatch = () => {
      for (let i = 0; i < batchSize && iteration < maxIterations; i++, iteration++) {
        // Use enhanced algorithm with single iteration per call
        const result = findTrueInscribedSquare(curve, allowRotation, 1)
        if (result && (!bestSquare || result.size > bestSquare.size)) {
          bestSquare = result
        }
      }
      
      if (onProgress) {
        onProgress(bestSquare, iteration)
      }
      
      if (iteration < maxIterations) {
        setTimeout(processNextBatch, 10) // Slightly longer delay for better UI responsiveness
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

