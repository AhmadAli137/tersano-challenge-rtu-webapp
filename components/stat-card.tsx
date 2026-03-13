"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDemoMode } from "@/contexts/demo-mode"
import { LucideIcon } from "lucide-react"

type NeonColor = "cyan" | "purple" | "pink" | "green" | "orange"

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  iconClassName?: string
  neonColor?: NeonColor
  isLive?: boolean
}

const neonColorClasses: Record<NeonColor, { bg: string; text: string; border: string }> = {
  cyan: { bg: "bg-neon-cyan/10", text: "text-neon-cyan", border: "border-neon-cyan/20" },
  purple: { bg: "bg-neon-purple/10", text: "text-neon-purple", border: "border-neon-purple/20" },
  pink: { bg: "bg-neon-pink/10", text: "text-neon-pink", border: "border-neon-pink/20" },
  green: { bg: "bg-neon-green/10", text: "text-neon-green", border: "border-neon-green/20" },
  orange: { bg: "bg-neon-orange/10", text: "text-neon-orange", border: "border-neon-orange/20" },
}

const normalColorClasses: Record<NeonColor, { bg: string; text: string }> = {
  cyan: { bg: "bg-chart-1/10", text: "text-chart-1" },
  purple: { bg: "bg-chart-2/10", text: "text-chart-2" },
  pink: { bg: "bg-chart-5/10", text: "text-chart-5" },
  green: { bg: "bg-chart-4/10", text: "text-chart-4" },
  orange: { bg: "bg-chart-3/10", text: "text-chart-3" },
}

export function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconClassName,
  neonColor = "cyan",
  isLive,
}: StatCardProps) {
  const { isDemoMode } = useDemoMode()
  // Use neon styling when live OR in demo mode
  const useNeonStyle = isLive || isDemoMode
  const neonClasses = neonColorClasses[neonColor]
  const normalClasses = normalColorClasses[neonColor]

  return (
    <Card className={cn(
      "relative overflow-hidden border-border/50",
      useNeonStyle && neonClasses.border,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "rounded-md p-1.5",
          useNeonStyle ? neonClasses.bg : normalClasses.bg,
          iconClassName
        )}>
          <Icon className={cn(
            "h-3.5 w-3.5",
            useNeonStyle ? neonClasses.text : normalClasses.text
          )} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-semibold tracking-tight font-mono tabular-nums",
            useNeonStyle && neonClasses.text
          )}>{value}</span>
          {unit && (
            <span className="text-xs font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {trend && trendValue && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              trend === "up" && (useNeonStyle ? "text-neon-green" : "text-success"),
              trend === "down" && (useNeonStyle ? "text-neon-pink" : "text-destructive"),
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {trend === "up" && "↑ "}
            {trend === "down" && "↓ "}
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
