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

  const chartData = data.map((reading, index) => ({
    time: format(new Date(reading.created_at), "h:mm:ss a"),
    value: reading[dataKey] ?? 0,
    fullTime: reading.created_at,
    isCached: reading.was_cached === true,
    index,
  }))
  
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
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">Live data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-neon-orange border border-white" />
            <span className="text-muted-foreground">Cached (from backlog)</span>
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
                      <p className="text-xs text-neon-orange font-medium mt-1">
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
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            dot={({ cx, cy, payload }) => {
              if (payload.isCached) {
                return (
                  <circle
                    key={`cached-${payload.index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--neon-orange)"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                )
              }
              return <circle key={`normal-${payload.index}`} cx={cx} cy={cy} r={0} />
            }}
          />
        </AreaChart>
      ) : (
        <div className="h-full w-full animate-pulse bg-muted/30 rounded" />
      )}
      </div>
    </div>
  )
}
