import React, { useRef, useEffect, forwardRef, useState, useCallback } from 'react'
import { Point, Square } from '@/types'
import { useTheme } from 'next-themes'

interface DrawingCanvasProps {
  onDrawingComplete: (points: Point[]) => void
  square: Square | null
  showGrid: boolean
  selectedTool: string
  polygonEdges: number
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ onDrawingComplete, square, showGrid, selectedTool, polygonEdges }, ref) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentShape, setCurrentShape] = useState<Point[]>([])
    const [hoverPoint, setHoverPoint] = useState<Point | null>(null)
    const [centerPoint, setCenterPoint] = useState<Point | null>(null)
    const { theme } = useTheme()

    const isDarkMode = theme === 'dark'

    const getMousePos = useCallback((canvas: HTMLCanvasElement, evt: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
      }
    }, [])

    useEffect(() => {
      const canvas = ref && 'current' in ref ? ref.current : null;
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        if (showGrid) {
          drawGrid(ctx, canvas.width, canvas.height)
        }

        // Draw current shape
        if (currentShape.length > 0) {
          ctx.beginPath()
          ctx.moveTo(currentShape[0].x, currentShape[0].y)
          currentShape.forEach((point, index) => {
            if (index > 0) ctx.lineTo(point.x, point.y)
          })
          if ((selectedTool === 'circle' || selectedTool === 'polygon') && currentShape.length > 2) {
            ctx.closePath()
          }
          ctx.strokeStyle = isDarkMode ? 'hsl(142, 76%, 36%)' : 'hsl(221.2, 83.2%, 53.3%)'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Draw the square if it exists
        if (square && square.points.length === 4) {
          ctx.beginPath()
          ctx.moveTo(square.points[0].x, square.points[0].y)
          square.points.forEach((point) => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.closePath()
          ctx.strokeStyle = square.type === 'inscribed' 
            ? 'hsl(142, 76%, 36%)'  // Green color for inscribed square
            : (isDarkMode ? 'hsl(0, 84%, 60%)' : 'hsl(0, 84.2%, 60.2%)')
          ctx.lineWidth = 2
          ctx.stroke()
        }

        // Draw hover guidance
        if (hoverPoint) {
          ctx.beginPath()
          ctx.arc(hoverPoint.x, hoverPoint.y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = isDarkMode ? 'hsla(142, 76%, 36%, 0.5)' : 'hsla(221.2, 83.2%, 53.3%, 0.5)'
          ctx.fill()
          ctx.font = '12px Inter'
          ctx.fillStyle = isDarkMode ? 'hsl(0, 0%, 90%)' : 'hsl(222.2, 84%, 4.9%)'
          ctx.fillText(`(${(hoverPoint.x / 1000).toFixed(2)}kpx, ${(hoverPoint.y / 1000).toFixed(2)}kpx)`, hoverPoint.x + 10, hoverPoint.y - 10)
        }

        // Draw center point for circle and polygon
        if (centerPoint && (selectedTool === 'circle' || selectedTool === 'polygon')) {
          ctx.beginPath()
          ctx.arc(centerPoint.x, centerPoint.y, 3, 0, 2 * Math.PI)
          ctx.fillStyle = isDarkMode ? 'hsl(142, 76%, 36%)' : 'hsl(221.2, 83.2%, 53.3%)'
          ctx.fill()
        }
      }

      draw()
    }, [currentShape, square, showGrid, hoverPoint, centerPoint, selectedTool, isDarkMode, ref])

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.beginPath()
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.3)'
      ctx.lineWidth = 0.5

      const step = 50 // 0.05 kilopixels
      for (let x = 0; x <= width; x += step) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        ctx.fillText(`${(x / 1000).toFixed(2)}`, x, height - 5)
      }
      for (let y = 0; y <= height; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        ctx.fillText(`${(y / 1000).toFixed(2)}`, 5, y)
      }

      ctx.stroke()
    }

    const drawPolygon = (center: Point, endPoint: Point) => {
      const radius = Math.sqrt(
        Math.pow(endPoint.x - center.x, 2) + Math.pow(endPoint.y - center.y, 2)
      )
      const newPolygon: Point[] = []
      for (let i = 0; i <= polygonEdges; i++) {
        const angle = (i * 2 * Math.PI) / polygonEdges
        newPolygon.push({
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        })
      }
      setCurrentShape(newPolygon)
    }

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget
      const newPoint = getMousePos(canvas, e)
      setIsDrawing(true)
      setCurrentShape([newPoint])
      if (selectedTool === 'circle' || selectedTool === 'polygon') {
        setCenterPoint(newPoint)
      }
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget
      const newPoint = getMousePos(canvas, e)
      setHoverPoint(newPoint)
      if (!isDrawing) return

      switch (selectedTool) {
        case 'freehand':
          setCurrentShape(prevShape => [...prevShape, newPoint])
          break
        case 'line':
          setCurrentShape([currentShape[0], newPoint])
          break
        case 'circle':
          if (centerPoint) {
            drawCircle(centerPoint, newPoint)
          }
          break
        case 'rectangle':
          drawRectangle(newPoint)
          break
        case 'polygon':
          if (centerPoint) {
            drawPolygon(centerPoint, newPoint)
          }
          break
      }
    }

    const drawCircle = (center: Point, endPoint: Point) => {
      const radius = Math.sqrt(
        Math.pow(endPoint.x - center.x, 2) + Math.pow(endPoint.y - center.y, 2)
      )
      const newCircle: Point[] = []
      for (let i = 0; i <= 360; i += 5) {
        const radian = (i * Math.PI) / 180
        newCircle.push({
          x: center.x + radius * Math.cos(radian),
          y: center.y + radius * Math.sin(radian),
        })
      }
      setCurrentShape(newCircle)
    }

    const drawRectangle = (endPoint: Point) => {
      const startPoint = currentShape[0]
      setCurrentShape([
        startPoint,
        { x: endPoint.x, y: startPoint.y },
        endPoint,
        { x: startPoint.x, y: endPoint.y },
        startPoint,
      ])
    }

    const stopDrawing = () => {
      setIsDrawing(false)
      setCenterPoint(null)
      if (currentShape.length > 1) {
        onDrawingComplete(currentShape)
      }
    }

    return (
      <canvas
        ref={ref}
        width={600}
        height={400}
        className="w-full h-auto border border-border rounded-md shadow-sm bg-background"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={() => {
          stopDrawing()
          setHoverPoint(null)
        }}
      />
    )
  }
)

DrawingCanvas.displayName = 'DrawingCanvas'

export default DrawingCanvas

