"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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

const colorClasses: Record<NeonColor, { text: string }> = {
  cyan: { text: "text-tersano-teal" },
  purple: { text: "text-neon-purple" },
  pink: { text: "text-neon-pink" },
  green: { text: "text-neon-green" },
  orange: { text: "text-neon-orange" },
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
  const classes = colorClasses[neonColor]

  return (
    <Card className={cn("border-border", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums tracking-tight">{value}</span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {trendValue && (
              <p className={cn(
                "text-xs",
                trend === "up" && "text-neon-green",
                trend === "down" && "text-neon-orange",
                trend === "neutral" && "text-muted-foreground",
                !trend && "text-muted-foreground"
              )}>
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendValue}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-md bg-muted", iconClassName)}>
            <Icon className={cn("h-4 w-4", classes.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
