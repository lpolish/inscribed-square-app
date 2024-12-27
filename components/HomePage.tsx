'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import DrawingCanvas from '@/components/DrawingCanvas'
import MathData from '@/components/MathData'
import GeometricalTools from '@/components/GeometricalTools'
import { findInscribedSquare, findExtendedSquare } from '@/lib/squareFinder'
import { Point, Square, CurveData } from '@/types'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import AboutSection from '@/components/AboutSection'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('HomePage')
  const [curve, setCurve] = useState<Point[]>([])
  const [square, setSquare] = useState<Square | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [curveData, setCurveData] = useState<CurveData | null>(null)
  const [selectedTool, setSelectedTool] = useState<string>('freehand')
  const [polygonEdges, setPolygonEdges] = useState(6)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleDrawingComplete = (points: Point[]) => {
    setCurve(points)
    setSquare(null)
    setCurveData({
      length: calculateCurveLength(points),
      area: calculateCurveArea(points),
      centroid: calculateCentroid(points),
      boundingBox: calculateBoundingBox(points),
    })
  }

  const handleFindInscribedSquare = () => {
    const inscribedSquare = findInscribedSquare(curve)
    setSquare({ points: inscribedSquare, type: 'inscribed' })
  }

  const handleFindExtendedSquare = () => {
    const extendedSquare = findExtendedSquare(curve)
    setSquare({ points: extendedSquare, type: 'extended' })
  }

  const clearCanvas = () => {
    setCurve([])
    setSquare(null)
    setCurveData(null)
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleClear = () => {
    clearCanvas()
  }

  const calculateCurveLength = (points: Point[]): number => {
    let length = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x
      const dy = points[i].y - points[i-1].y
      length += Math.sqrt(dx * dx + dy * dy)
    }
    return Math.round(length / 1000) // Convert to kilopixels
  }

  const calculateCurveArea = (points: Point[]): number => {
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area / 2) / 1000000 // Convert to square kilopixels
  }

  const calculateCentroid = (points: Point[]): Point => {
    let cx = 0, cy = 0
    for (let i = 0; i < points.length; i++) {
      cx += points[i].x
      cy += points[i].y
    }
    return { x: cx / points.length / 1000, y: cy / points.length / 1000 } // Convert to kilopixels
  }

  const calculateBoundingBox = (points: Point[]): { min: Point, max: Point } => {
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    return {
      min: { x: Math.min(...xs) / 1000, y: Math.min(...ys) / 1000 }, // Convert to kilopixels
      max: { x: Math.max(...xs) / 1000, y: Math.max(...ys) / 1000 } // Convert to kilopixels
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <DrawingCanvas
              ref={canvasRef}
              onDrawingComplete={handleDrawingComplete}
              square={square}
              showGrid={showGrid}
              selectedTool={selectedTool}
              polygonEdges={polygonEdges}
            />
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleFindInscribedSquare} disabled={curve.length === 0}>
                {t('buttons.findInscribed')}
              </Button>
              <Button onClick={handleFindExtendedSquare} disabled={curve.length === 0}>
                {t('buttons.findExtended')}
              </Button>
              <Button onClick={handleClear} variant="outline">{t('buttons.clear')}</Button>
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <label htmlFor="show-grid" className="text-sm font-medium">{t('labels.showGrid')}</label>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <GeometricalTools 
              selectedTool={selectedTool} 
              setSelectedTool={(tool) => {
                setSelectedTool(tool)
                clearCanvas()
              }}
              polygonEdges={polygonEdges}
              setPolygonEdges={setPolygonEdges}
              getPolygonName={(edges) => {
                const names = ['', '', '', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'nonagon', 'decagon'];
                return edges <= 10 ? t(`tools.${names[edges]}`) : t('tools.polygon', { count: edges });
              }}
            />
            <MathData curveData={curveData} square={square} />
          </div>
        </div>
        <AboutSection />
        <section className="mt-12 text-center">
          <p className="text-lg">{t('footer.creator')}</p>
          <Link 
            href="https://github.com/lpolish/inscribed-square-app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t('footer.sourceCode')}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

