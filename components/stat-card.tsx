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
}

const neonColorClasses: Record<NeonColor, { bg: string; text: string; glow: string }> = {
  cyan: { bg: "bg-neon-cyan/20", text: "text-neon-cyan", glow: "glow-cyan" },
  purple: { bg: "bg-neon-purple/20", text: "text-neon-purple", glow: "glow-purple" },
  pink: { bg: "bg-neon-pink/20", text: "text-neon-pink", glow: "glow-pink" },
  green: { bg: "bg-neon-green/20", text: "text-neon-green", glow: "glow-green" },
  orange: { bg: "bg-neon-orange/20", text: "text-neon-orange", glow: "glow-orange" },
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
}: StatCardProps) {
  const { isDemoMode } = useDemoMode()
  const colorClasses = neonColorClasses[neonColor]

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      isDemoMode && `border-${neonColor === "cyan" ? "neon-cyan" : neonColor === "purple" ? "neon-purple" : neonColor === "pink" ? "neon-pink" : neonColor === "green" ? "neon-green" : "neon-orange"}/30`,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "rounded-md p-2 transition-all",
          isDemoMode ? colorClasses.bg : "bg-primary/10",
          iconClassName
        )}>
          <Icon className={cn(
            "h-4 w-4 transition-colors",
            isDemoMode ? colorClasses.text : "text-primary"
          )} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-bold tracking-tight font-mono tabular-nums",
            isDemoMode && colorClasses.text
          )}>{value}</span>
          {unit && (
            <span className="text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {trend && trendValue && (
          <p
            className={cn(
              "mt-1 text-xs",
              trend === "up" && (isDemoMode ? "text-neon-green" : "text-green-600 dark:text-green-400"),
              trend === "down" && (isDemoMode ? "text-neon-pink" : "text-red-600 dark:text-red-400"),
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
