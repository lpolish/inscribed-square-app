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

// New approach: Direct curve-based square construction
function findSquareOnCurve(
  curve: Point[], 
  curveInfo: ReturnType<typeof preprocessCurve>,
  allowRotation: boolean,
  iterations: number
): { points: Point[], center: Point, size: number, rotation: number } | null {
  let bestResult: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  // Sample points directly from the curve
  const curvePoints = curve
  const numPoints = curvePoints.length
  
  for (let i = 0; i < iterations; i++) {
    // Pick a random starting point on the curve
    const startIdx = Math.floor(Math.random() * numPoints)
    const p1 = curvePoints[startIdx]
    
    // Try to find three other points that form a square with p1
    for (let j = 1; j < numPoints; j++) {
      const p2Idx = (startIdx + j) % numPoints
      const p2 = curvePoints[p2Idx]
      
      // Calculate the side vector
      const side = { x: p2.x - p1.x, y: p2.y - p1.y }
      const sideLength = Math.sqrt(side.x * side.x + side.y * side.y)
      
      if (sideLength < 10) continue // Skip too small sides
      
      // Calculate the perpendicular vector (for 90-degree rotation)
      const perp = { x: -side.y, y: side.x }
      
      // Calculate the other two vertices of the square
      const p3 = { x: p2.x + perp.x, y: p2.y + perp.y }
      const p4 = { x: p1.x + perp.x, y: p1.y + perp.y }
      
      // Find closest points on curve for p3 and p4
      const p3Closest = findClosestPointOnCurve(p3, curve)
      const p4Closest = findClosestPointOnCurve(p4, curve)
      
      // Check if the projected points are close enough to the ideal positions
      const p3Distance = Math.sqrt(distanceSquared(p3, p3Closest))
      const p4Distance = Math.sqrt(distanceSquared(p4, p4Closest))
      const maxProjectionDistance = sideLength * 0.1 // Allow 10% projection distance
      
      if (p3Distance > maxProjectionDistance || p4Distance > maxProjectionDistance) {
        continue
      }
      
      const candidateSquare = [p1, p2, p3Closest, p4Closest]
      
      // Validate this is actually a square
      if (validateTrueSquare(candidateSquare)) {
        const area = calculateSquareArea(candidateSquare)
        if (area > maxArea) {
          maxArea = area
          const center = calculateSquareCenter(candidateSquare)
          const rotation = Math.atan2(side.y, side.x)
          bestResult = {
            points: candidateSquare,
            center,
            size: sideLength,
            rotation
          }
        }
      }
      
      // Also try the square on the other side
      const p3Alt = { x: p2.x - perp.x, y: p2.y - perp.y }
      const p4Alt = { x: p1.x - perp.x, y: p1.y - perp.y }
      
      const p3AltClosest = findClosestPointOnCurve(p3Alt, curve)
      const p4AltClosest = findClosestPointOnCurve(p4Alt, curve)
      
      const p3AltDistance = Math.sqrt(distanceSquared(p3Alt, p3AltClosest))
      const p4AltDistance = Math.sqrt(distanceSquared(p4Alt, p4AltClosest))
      
      if (p3AltDistance <= maxProjectionDistance && p4AltDistance <= maxProjectionDistance) {
        const candidateSquareAlt = [p1, p2, p3AltClosest, p4AltClosest]
        
        if (validateTrueSquare(candidateSquareAlt)) {
          const areaAlt = calculateSquareArea(candidateSquareAlt)
          if (areaAlt > maxArea) {
            maxArea = areaAlt
            const center = calculateSquareCenter(candidateSquareAlt)
            const rotation = Math.atan2(side.y, side.x)
            bestResult = {
              points: candidateSquareAlt,
              center,
              size: sideLength,
              rotation
            }
          }
        }
      }
    }
  }
  
  return bestResult
}

// Strategy 2: Optimized center-based search (simplified)
function optimizedCenterSearch(
  curve: Point[], 
  curveInfo: ReturnType<typeof preprocessCurve>,
  allowRotation: boolean,
  iterations: number
): { points: Point[], center: Point, size: number, rotation: number } | null {
  let bestResult: { points: Point[], center: Point, size: number, rotation: number } | null = null
  let maxArea = 0
  
  for (let i = 0; i < iterations; i++) {
    // Use better center candidates
    const center = i < iterations * 0.3 ? 
      curveInfo.centroid : 
      getRandomPoint(curveInfo.boundingBox.minX, curveInfo.boundingBox.maxX, 
                    curveInfo.boundingBox.minY, curveInfo.boundingBox.maxY)
    
    if (!isPointInside(center, curve)) continue
    
    const rotations = allowRotation ? 
      Array.from({ length: 18 }, (_, i) => i * Math.PI / 9) : // Reduced rotations for efficiency
      [0]
    
    for (const rotation of rotations) {
      // Try different square sizes more efficiently
      const maxSize = curveInfo.avgRadius * 1.2
      for (let size = 5; size < maxSize; size += maxSize / 20) {
        const squarePoints = generateRotatedSquare(center, size, rotation)
        
        // Only proceed if all vertices are reasonably close to the curve
        const projectedVertices = squarePoints.map(vertex => 
          findClosestPointOnCurve(vertex, curve))
        
        // Check projection distances are reasonable
        let maxProjectionDistance = 0
        for (let j = 0; j < 4; j++) {
          const projDistance = Math.sqrt(distanceSquared(squarePoints[j], projectedVertices[j]))
          maxProjectionDistance = Math.max(maxProjectionDistance, projDistance)
        }
        
        // Only consider if projections are reasonable (within 15% of square size)
        if (maxProjectionDistance > size * 0.15) continue
        
        if (validateTrueSquare(projectedVertices)) {
          const area = calculateSquareArea(projectedVertices)
          if (area > maxArea) {
            maxArea = area
            bestResult = {
              points: projectedVertices,
              center: calculateSquareCenter(projectedVertices),
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

// Helper function to interpolate a point on the parametric curve (simplified)
function interpolateOnCurve(parametricPoints: { point: Point, t: number }[], t: number): Point {
  if (parametricPoints.length === 0) return { x: 0, y: 0 }
  
  // Simple approach: find closest parametric point
  let closestPoint = parametricPoints[0].point
  let minDiff = Math.abs(parametricPoints[0].t - t)
  
  for (const param of parametricPoints) {
    const diff = Math.abs(param.t - t)
    if (diff < minDiff) {
      minDiff = diff
      closestPoint = param.point
    }
  }
  
  return closestPoint
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

// Enhanced validation for true squares (much stricter)
function validateTrueSquare(points: Point[]): boolean {
  if (points.length !== 4) return false
  
  // Calculate all side lengths
  const sides = []
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
    sides.push(Math.sqrt(distanceSquared(points[i], points[j])))
  }
  
  // Calculate diagonals
  const diagonal1 = Math.sqrt(distanceSquared(points[0], points[2]))
  const diagonal2 = Math.sqrt(distanceSquared(points[1], points[3]))
  
  // Check if all sides are approximately equal (very strict tolerance)
  const avgSide = sides.reduce((sum, s) => sum + s, 0) / 4
  const sideTolerance = avgSide * 0.05 // Only 5% tolerance for true squares
  const sidesEqual = sides.every(side => Math.abs(side - avgSide) < sideTolerance)
  
  // Check if diagonals are approximately equal
  const diagonalTolerance = avgSide * 0.05
  const diagonalsEqual = Math.abs(diagonal1 - diagonal2) < diagonalTolerance
  
  // Check if diagonal length is approximately sqrt(2) times side length
  const expectedDiagonal = avgSide * Math.sqrt(2)
  const diagonalCorrect = Math.abs((diagonal1 + diagonal2) / 2 - expectedDiagonal) < diagonalTolerance * Math.sqrt(2)
  
  // Check if angles are approximately 90 degrees using dot products
  let anglesCorrect = true
  for (let i = 0; i < 4; i++) {
    const prev = (i + 3) % 4
    const next = (i + 1) % 4
    
    // Vector from current point to previous and next
    const v1 = { x: points[prev].x - points[i].x, y: points[prev].y - points[i].y }
    const v2 = { x: points[next].x - points[i].x, y: points[next].y - points[i].y }
    
    // Dot product should be near zero for 90-degree angles
    const dotProduct = v1.x * v2.x + v1.y * v2.y
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
    
    if (magnitude1 > 0 && magnitude2 > 0) {
      const cosAngle = dotProduct / (magnitude1 * magnitude2)
      if (Math.abs(cosAngle) > 0.1) { // Allow small deviation from 90 degrees
        anglesCorrect = false
        break
      }
    }
  }
  
  return sidesEqual && diagonalsEqual && diagonalCorrect && anglesCorrect
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
  
  // Use the new direct curve-based approach for much better results
  const strategies = [
    () => findSquareOnCurve(curve, curveInfo, allowRotation, iterations * 0.6),
    () => optimizedCenterSearch(curve, curveInfo, allowRotation, iterations * 0.4)
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
  return validateTrueSquare(points)
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

