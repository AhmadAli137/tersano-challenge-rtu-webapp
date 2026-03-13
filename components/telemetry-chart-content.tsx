"use client"

import { useRef, useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TelemetryRow } from "@/lib/types"
import { format } from "date-fns"

interface TelemetryChartContentProps {
  data: TelemetryRow[]
  dataKey: keyof Pick<TelemetryRow, "temperature_c" | "humidity_pct" | "pressure_hpa" | "battery_v">
  color: string
  unit: string
}

export function TelemetryChartContent({
  data,
  dataKey,
  color,
  unit,
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

  const chartData = data.map((reading) => ({
    time: format(new Date(reading.created_at), "h:mm:ss a"),
    value: reading[dataKey] ?? 0,
    fullTime: reading.created_at,
  }))

  return (
    <div ref={containerRef} className="w-full h-[180px]">
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
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payload[0].payload.fullTime), "PPpp")}
                    </p>
                    <p className="text-sm font-medium">
                      {payload[0].value}{unit}
                    </p>
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
          />
        </AreaChart>
      ) : (
        <div className="h-full w-full animate-pulse bg-muted/30 rounded" />
      )}
    </div>
  )
}
