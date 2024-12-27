import React from 'react'
import { useTranslations } from 'next-intl'
import { CurveData, Square } from '@/types'

export interface MathDataProps {
  curveData: CurveData | null
  square: Square | null
}

const MathData = ({ curveData, square }: MathDataProps) => {
  const t = useTranslations('mathData')
  const tUnits = useTranslations('units')

  const calculateSquareArea = (square: Square | null): number => {
    if (!square || square.points.length !== 4) return 0
    const side = Math.sqrt(
      Math.pow(square.points[1].x - square.points[0].x, 2) +
      Math.pow(square.points[1].y - square.points[0].y, 2)
    )
    return (side * side) / 1000000 // Convert to square kilopixels
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      {curveData ? (
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">{t('curveLength')}</div>
            <div className="math-value">
              {curveData.length.toFixed(4)} {tUnits('kilopixels')}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{t('curveArea')}</div>
            <div className="math-value">
              {curveData.area.toFixed(4)} {tUnits('squareKilopixels')}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{t('centroid')}</div>
            <div className="math-value">
              ({curveData.centroid.x.toFixed(4)}kpx, {curveData.centroid.y.toFixed(4)}kpx)
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{t('boundingBox')}</div>
            <div className="math-value">
              {t('min')}: ({curveData.boundingBox.min.x.toFixed(4)}kpx, {curveData.boundingBox.min.y.toFixed(4)}kpx)<br />
              {t('max')}: ({curveData.boundingBox.max.x.toFixed(4)}kpx, {curveData.boundingBox.max.y.toFixed(4)}kpx)
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm italic text-muted-foreground">{t('noData')}</p>
      )}
      {square && (
        <div className="pt-3 border-t space-y-3">
          <div>
            <div className="text-sm font-medium">{t('squareType')}</div>
            <div className="math-value">{t(square.type)}</div>
          </div>
          <div>
            <div className="text-sm font-medium">{t('squareArea')}</div>
            <div className="math-value">
              {calculateSquareArea(square).toFixed(4)} {tUnits('squareKilopixels')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MathData

