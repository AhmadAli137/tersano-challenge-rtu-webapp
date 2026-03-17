"use client"

import { useRef, useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts"
import { TelemetryRow } from "@/lib/types"
import { format } from "date-fns"

interface TelemetryChartContentProps {
  data: TelemetryRow[]
  dataKey: keyof Pick<TelemetryRow, "temperature_c" | "humidity_pct" | "pressure_hpa" | "battery_v">
  color: string
  unit: string
  showCachedLegend?: boolean
}

export function TelemetryChartContent({
  data,
  dataKey,
  color,
  unit,
  showCachedLegend = true,
}: TelemetryChartContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Split data into live and cached values for dual-line rendering
  const chartData = data.map((reading, index) => {
    const value = reading[dataKey] ?? 0
    const isCached = reading.was_cached === true
    return {
      time: format(new Date(reading.created_at), "h:mm:ss a"),
      value,
      liveValue: isCached ? null : value,
      cachedValue: isCached ? value : null,
      fullTime: reading.created_at,
      isCached,
      index,
    }
  })
  
  // Check if there are cached data points
  const hasCachedData = chartData.some(d => d.isCached)
  
  console.log("[v0] Chart data cached check:", { 
    totalPoints: chartData.length, 
    cachedPoints: chartData.filter(d => d.isCached).length,
    hasCachedData,
    sampleCached: chartData.filter(d => d.isCached).slice(0, 2)
  })
  
  // For smooth transitions between live/cached, we need to connect the segments
  // by duplicating boundary points
  const processedData = chartData.map((point, i) => {
    const prev = chartData[i - 1]
    const next = chartData[i + 1]
    
    // If this is a boundary point (transition between cached and live), include value in both
    const isTransitionFromCached = prev && prev.isCached && !point.isCached
    const isTransitionToCached = next && next.isCached && !point.isCached
    const isTransitionFromLive = prev && !prev.isCached && point.isCached
    const isTransitionToLive = next && !next.isCached && point.isCached
    
    return {
      ...point,
      liveValue: point.isCached ? (isTransitionFromLive || isTransitionToLive ? point.value : null) : point.value,
      cachedValue: point.isCached ? point.value : (isTransitionFromCached || isTransitionToCached ? point.value : null),
    }
  })

  // Calculate min/max with padding to make trends more visible
  const values = chartData.map(d => d.value as number).filter(v => v !== null && v !== undefined)
  const minValue = values.length > 0 ? Math.min(...values) : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 100
  const range = maxValue - minValue
  const padding = range > 0 ? range * 0.15 : 1 // 15% padding or 1 unit if no range
  const yMin = Math.floor((minValue - padding) * 10) / 10
  const yMax = Math.ceil((maxValue + padding) * 10) / 10

  return (
    <div ref={containerRef} className="w-full">
      {showCachedLegend && hasCachedData && (
        <div className="flex items-center gap-4 mb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded bg-cached" />
            <span className="text-muted-foreground">Cached (offline backlog)</span>
          </div>
        </div>
      )}
      <div className="h-[180px]">
      {chartWidth > 0 ? (
        <AreaChart
          width={chartWidth}
          height={180}
          data={processedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`gradient-cached-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cached)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--cached)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const isCached = payload[0].payload.isCached
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payload[0].payload.fullTime), "PPpp")}
                    </p>
                    <p className="text-sm font-medium">
                      {payload[0].value}{unit}
                    </p>
                    {isCached && (
                      <p className="text-xs text-cached font-medium mt-1">
                        Cached from backlog
                      </p>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="liveValue"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            dot={false}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="cachedValue"
            stroke="var(--cached)"
            strokeWidth={2}
            fill={`url(#gradient-cached-${dataKey})`}
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      ) : (
        <div className="h-full w-full animate-pulse bg-muted/30 rounded" />
      )}
      </div>
    </div>
  )
}
