"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DeviceStatus } from "@/lib/types"
import { useDemoMode } from "@/contexts/demo-mode"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { Activity, AlertTriangle, CheckCircle, Info, Power, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface EventsListProps {
  events: DeviceStatus[]
  title?: string
  description?: string
  maxHeight?: string
}

const eventIcons: Record<string, typeof Activity> = {
  boot: Power,
  online: Wifi,
  offline: WifiOff,
  error: AlertTriangle,
  warning: AlertTriangle,
  calibrated: CheckCircle,
  reset: RefreshCw,
  default: Info,
}

const eventColors: Record<string, string> = {
  boot: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  online: "bg-green-500/10 text-green-600 dark:text-green-400",
  offline: "bg-red-500/10 text-red-600 dark:text-red-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  calibrated: "bg-green-500/10 text-green-600 dark:text-green-400",
  reset: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  default: "bg-muted text-muted-foreground",
}

const neonEventColors: Record<string, string> = {
  boot: "bg-neon-purple/20 text-neon-purple",
  online: "bg-neon-green/20 text-neon-green",
  offline: "bg-neon-pink/20 text-neon-pink",
  error: "bg-neon-pink/20 text-neon-pink",
  warning: "bg-neon-orange/20 text-neon-orange",
  calibrated: "bg-neon-cyan/20 text-neon-cyan",
  reset: "bg-neon-orange/20 text-neon-orange",
  default: "bg-neon-cyan/20 text-neon-cyan",
}

function getEventIcon(event: string) {
  const normalizedEvent = event.toLowerCase()
  for (const [key, Icon] of Object.entries(eventIcons)) {
    if (normalizedEvent.includes(key)) return Icon
  }
  return eventIcons.default
}

function getEventColor(event: string, isNeon = false) {
  const normalizedEvent = event.toLowerCase()
  const colors = isNeon ? neonEventColors : eventColors
  for (const [key, color] of Object.entries(colors)) {
    if (normalizedEvent.includes(key)) return color
  }
  return colors.default
}

export function EventsList({
  events,
  title = "Device Events",
  description,
  maxHeight = "400px",
}: EventsListProps) {
  const { isDemoMode } = useDemoMode()
  
  return (
    <Card className={cn(isDemoMode && "border-neon-pink/30")}>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className={cn("h-4 w-4", isDemoMode ? "text-neon-pink" : "text-primary")} />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No events recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const Icon = getEventIcon(event.event)
                const colorClass = getEventColor(event.event, isDemoMode)
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{event.event}</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {event.device_id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(event.created_at), "PPp")}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                      </div>
                      {event.uptime_ms !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uptime: {Math.floor(event.uptime_ms / 1000 / 60)}m {Math.floor((event.uptime_ms / 1000) % 60)}s
                        </p>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto font-mono">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
