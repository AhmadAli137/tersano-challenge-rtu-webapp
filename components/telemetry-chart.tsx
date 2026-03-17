"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TelemetryRow } from "@/lib/types"
import { cn } from "@/lib/utils"

// Dynamically import the chart content with no SSR to avoid hydration mismatches
const TelemetryChartContent = dynamic(
  () => import("./telemetry-chart-content").then((mod) => mod.TelemetryChartContent),
  { 
    ssr: false,
    loading: () => <div className="h-[180px] w-full animate-pulse bg-muted/30 rounded" />
  }
)

interface TelemetryChartProps {
  data: TelemetryRow[]
  dataKey: keyof Pick<TelemetryRow, "temperature_c" | "humidity_pct" | "pressure_hpa" | "battery_v">
  title: string
  description?: string
  color?: string
  unit?: string
}

export function TelemetryChart({
  data,
  dataKey,
  title,
  description,
  color = "var(--color-primary)",
  unit = "",
}: TelemetryChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-4">
        <TelemetryChartContent
          data={data}
          dataKey={dataKey}
          color={color}
          unit={unit}
        />
      </CardContent>
    </Card>
  )
}
