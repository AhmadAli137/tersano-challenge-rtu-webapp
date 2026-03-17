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

  // Sort data by created_at to ensure chronological order
  const sortedData = [...data].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  
  // Build chart data with separate liveValue and cachedValue keys
  // Include boundary points in both series for smooth transitions
  const chartData = sortedData.map((reading, index) => {
    const value = reading[dataKey] ?? 0
    const isCached = reading.was_cached === true
    const prev = sortedData[index - 1]
    const next = sortedData[index + 1]
    
    // Determine if this point should appear in live or cached series
    const isLive = !isCached
    const isBoundaryFromLive = isCached && prev && prev.was_cached !== true
    const isBoundaryToLive = isCached && next && next.was_cached !== true
    const isBoundaryFromCached = !isCached && prev && prev.was_cached === true
    const isBoundaryToCached = !isCached && next && next.was_cached === true
    
    return {
      time: format(new Date(reading.created_at), "h:mm:ss a"),
      value,
      liveValue: isLive || isBoundaryFromCached || isBoundaryToCached ? value : null,
      cachedValue: isCached || isBoundaryFromLive || isBoundaryToLive ? value : null,
      fullTime: reading.created_at,
      isCached,
      index,
    }
  })
  
  // Check if there are cached data points
  const hasCachedData = chartData.some(d => d.isCached)

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
          data={chartData}
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
                const pointData = payload[0].payload
                const isCached = pointData.isCached
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pointData.fullTime), "PPpp")}
                    </p>
                    <p className="text-sm font-medium">
                      {pointData.value}{unit}
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
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="cachedValue"
            stroke="var(--cached)"
            strokeWidth={2}
            fill={`url(#gradient-cached-${dataKey})`}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <div className="h-full w-full animate-pulse bg-muted/30 rounded" />
      )}
      </div>
    </div>
  )
}
