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
  // Get border color based on the dataKey
  const getBorderColor = () => {
    switch (dataKey) {
      case "temperature_c": return "border-tersano-teal/30"
      case "humidity_pct": return "border-neon-purple/30"
      case "pressure_hpa": return "border-neon-orange/30"
      case "battery_v": return "border-neon-green/30"
      default: return "border-border/50"
    }
  }

  return (
    <Card className={cn(getBorderColor())}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-3">
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
