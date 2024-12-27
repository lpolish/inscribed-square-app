import React from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from 'next-intl'

interface GeometricalToolsProps {
  selectedTool: string
  setSelectedTool: (tool: string) => void
  polygonEdges: number
  setPolygonEdges: (edges: number) => void
  getPolygonName: (edges: number) => string
}

const GeometricalTools: React.FC<GeometricalToolsProps> = ({ 
  selectedTool, 
  setSelectedTool, 
  polygonEdges, 
  setPolygonEdges,
  getPolygonName 
}) => {
  const t = useTranslations('HomePage.tools')

  const tools = [
    { id: 'freehand', name: t('freehand'), description: t('descriptions.freehand') },
    { id: 'line', name: t('line'), description: t('descriptions.line') },
    { id: 'circle', name: t('circle'), description: t('descriptions.circle') },
    { id: 'rectangle', name: t('rectangle'), description: t('descriptions.rectangle') },
    { id: 'polygon', name: t('polygon'), description: t('descriptions.polygon'), isPolygon: true },
  ]

  const handlePolygonEdgesChange = (value: number[]) => {
    setPolygonEdges(value[0])
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setSelectedTool(tool.id)}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                >
                  {tool.isPolygon ? getPolygonName(polygonEdges) : tool.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      {selectedTool === 'polygon' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('polygonEdges', { count: polygonEdges })}
          </label>
          <Slider
            min={3}
            max={12}
            step={1}
            value={[polygonEdges]}
            onValueChange={handlePolygonEdgesChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

export default GeometricalTools

