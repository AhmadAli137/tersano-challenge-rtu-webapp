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
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-5 px-5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-5">
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
