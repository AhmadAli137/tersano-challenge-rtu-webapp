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

const neonColorClasses: Record<NeonColor, { bg: string; text: string; border: string; gradient: string }> = {
  cyan: { bg: "bg-tersano-teal/10", text: "text-tersano-teal", border: "border-tersano-teal/30", gradient: "from-tersano-teal/5 to-transparent" },
  purple: { bg: "bg-neon-purple/10", text: "text-neon-purple", border: "border-neon-purple/30", gradient: "from-neon-purple/5 to-transparent" },
  pink: { bg: "bg-neon-pink/10", text: "text-neon-pink", border: "border-neon-pink/30", gradient: "from-neon-pink/5 to-transparent" },
  green: { bg: "bg-neon-green/10", text: "text-neon-green", border: "border-neon-green/30", gradient: "from-neon-green/5 to-transparent" },
  orange: { bg: "bg-neon-orange/10", text: "text-neon-orange", border: "border-neon-orange/30", gradient: "from-neon-orange/5 to-transparent" },
}

const normalColorClasses: Record<NeonColor, { bg: string; text: string }> = {
  cyan: { bg: "bg-muted/50", text: "text-muted-foreground" },
  purple: { bg: "bg-muted/50", text: "text-muted-foreground" },
  pink: { bg: "bg-muted/50", text: "text-muted-foreground" },
  green: { bg: "bg-muted/50", text: "text-muted-foreground" },
  orange: { bg: "bg-muted/50", text: "text-muted-foreground" },
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
      "relative overflow-hidden transition-all duration-200",
      useNeonStyle ? neonClasses.border : "border-border/50",
      useNeonStyle && "shadow-sm",
      className
    )}>
      {useNeonStyle && (
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", neonClasses.gradient)} />
      )}
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "rounded-lg p-2",
          useNeonStyle ? neonClasses.bg : normalClasses.bg,
          iconClassName
        )}>
          <Icon className={cn(
            "h-4 w-4",
            useNeonStyle ? neonClasses.text : normalClasses.text
          )} />
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "text-3xl font-semibold tracking-tight font-mono tabular-nums",
            useNeonStyle && neonClasses.text
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
              "mt-2 text-xs font-medium",
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
