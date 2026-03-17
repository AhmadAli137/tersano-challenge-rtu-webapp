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

const colorClasses: Record<NeonColor, { text: string; bg: string; border: string }> = {
  cyan: { text: "text-tersano-teal", bg: "bg-tersano-teal/10", border: "border-tersano-teal/20" },
  purple: { text: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  pink: { text: "text-neon-pink", bg: "bg-neon-pink/10", border: "border-neon-pink/20" },
  green: { text: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20" },
  orange: { text: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/20" },
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
    <Card className={cn("border shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-2xl font-bold tabular-nums tracking-tight", classes.text)}>{value}</span>
              {unit && (
                <span className="text-sm font-medium text-muted-foreground">{unit}</span>
              )}
            </div>
            {trendValue && (
              <p className={cn(
                "text-xs font-medium",
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
          <div className={cn("p-2.5 rounded-lg border", classes.bg, classes.border, iconClassName)}>
            <Icon className={cn("h-5 w-5", classes.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
