"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { DeviceStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { Activity, AlertTriangle, CheckCircle, Info, Power, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react"

interface EventsListProps {
  events: DeviceStatus[]
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

const eventStyles: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  boot: { 
    bg: "bg-neon-purple/5", 
    border: "border-neon-purple/30", 
    icon: "bg-neon-purple/20 text-neon-purple",
    gradient: "from-neon-purple/10 via-transparent to-transparent"
  },
  online: { 
    bg: "bg-neon-green/5", 
    border: "border-neon-green/30", 
    icon: "bg-neon-green/20 text-neon-green",
    gradient: "from-neon-green/10 via-transparent to-transparent"
  },
  offline: { 
    bg: "bg-neon-pink/5", 
    border: "border-neon-pink/30", 
    icon: "bg-neon-pink/20 text-neon-pink",
    gradient: "from-neon-pink/10 via-transparent to-transparent"
  },
  error: { 
    bg: "bg-neon-pink/5", 
    border: "border-neon-pink/30", 
    icon: "bg-neon-pink/20 text-neon-pink",
    gradient: "from-neon-pink/10 via-transparent to-transparent"
  },
  warning: { 
    bg: "bg-neon-orange/5", 
    border: "border-neon-orange/30", 
    icon: "bg-neon-orange/20 text-neon-orange",
    gradient: "from-neon-orange/10 via-transparent to-transparent"
  },
  calibrated: { 
    bg: "bg-tersano-teal/5", 
    border: "border-tersano-teal/30", 
    icon: "bg-tersano-teal/20 text-tersano-teal",
    gradient: "from-tersano-teal/10 via-transparent to-transparent"
  },
  reset: { 
    bg: "bg-neon-orange/5", 
    border: "border-neon-orange/30", 
    icon: "bg-neon-orange/20 text-neon-orange",
    gradient: "from-neon-orange/10 via-transparent to-transparent"
  },
  default: { 
    bg: "bg-tersano-teal/5", 
    border: "border-tersano-teal/30", 
    icon: "bg-tersano-teal/20 text-tersano-teal",
    gradient: "from-tersano-teal/10 via-transparent to-transparent"
  },
}

function getEventIcon(event: string) {
  const normalizedEvent = event.toLowerCase()
  for (const [key, Icon] of Object.entries(eventIcons)) {
    if (normalizedEvent.includes(key)) return Icon
  }
  return eventIcons.default
}

function getEventStyles(event: string) {
  const normalizedEvent = event.toLowerCase()
  for (const [key, styles] of Object.entries(eventStyles)) {
    if (normalizedEvent.includes(key)) return styles
  }
  return eventStyles.default
}

export function EventsList({
  events,
  maxHeight = "600px",
}: EventsListProps) {
  return (
    <ScrollArea style={{ height: maxHeight }} className="pr-4">
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <Activity className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-sm font-medium">No events recorded</p>
          <p className="text-xs mt-1">Events will appear here when devices report status changes</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-tersano-teal/50 via-neon-purple/30 to-transparent" />
          
          <div className="space-y-3">
            {events.map((event, index) => {
              const Icon = getEventIcon(event.event)
              const styles = getEventStyles(event.event)
              return (
                <div
                  key={event.id}
                  className={cn(
                    "relative flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                    styles.bg,
                    styles.border
                  )}
                >
                  {/* Gradient overlay */}
                  <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-r opacity-50", styles.gradient)} />
                  
                  {/* Icon with timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={cn("rounded-xl p-2.5", styles.icon)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{event.event}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {event.device_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      {event.uptime_ms !== null && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>Uptime: {Math.floor(event.uptime_ms / 1000 / 60)}m {Math.floor((event.uptime_ms / 1000) % 60)}s</span>
                        </>
                      )}
                    </div>
                    
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <pre className="mt-3 text-xs bg-background/50 backdrop-blur-sm p-3 rounded-lg overflow-x-auto font-mono border border-border/30">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ScrollArea>
  )
}
