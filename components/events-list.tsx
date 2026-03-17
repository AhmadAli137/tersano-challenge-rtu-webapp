"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeviceStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Power, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Clock,
  Zap,
  Heart,
  Settings,
  Bell,
  Shield,
  Timer,
  Radio,
  Cpu
} from "lucide-react"

interface EventsListProps {
  events: DeviceStatus[]
  maxHeight?: string
}

// Event type categorization with better semantic meaning
type EventCategory = "success" | "warning" | "error" | "heartbeat" | "command" | "system"

interface EventConfig {
  icon: typeof Activity
  category: EventCategory
  label: string
  description: string
}

const eventConfigs: Record<string, EventConfig> = {
  boot: { 
    icon: Power, 
    category: "system", 
    label: "Device Boot",
    description: "Device powered on and initialized"
  },
  online: { 
    icon: Wifi, 
    category: "success", 
    label: "Online",
    description: "Device connected to network"
  },
  offline: { 
    icon: WifiOff, 
    category: "error", 
    label: "Offline",
    description: "Device disconnected from network"
  },
  error: { 
    icon: AlertTriangle, 
    category: "error", 
    label: "Error",
    description: "An error occurred"
  },
  warning: { 
    icon: Bell, 
    category: "warning", 
    label: "Warning",
    description: "Attention required"
  },
  calibrat: { 
    icon: Settings, 
    category: "success", 
    label: "Calibrated",
    description: "Sensor calibration complete"
  },
  reset: { 
    icon: RotateCcw, 
    category: "warning", 
    label: "Reset",
    description: "Device was reset"
  },
  heartbeat: { 
    icon: Heart, 
    category: "heartbeat", 
    label: "Heartbeat",
    description: "Regular status check-in"
  },
  connect: { 
    icon: Radio, 
    category: "success", 
    label: "Connected",
    description: "Connection established"
  },
  disconnect: { 
    icon: WifiOff, 
    category: "error", 
    label: "Disconnected",
    description: "Connection lost"
  },
  config: { 
    icon: Settings, 
    category: "command", 
    label: "Configuration",
    description: "Settings updated"
  },
  sensor: { 
    icon: Cpu, 
    category: "system", 
    label: "Sensor",
    description: "Sensor event"
  },
  battery: { 
    icon: Zap, 
    category: "warning", 
    label: "Battery",
    description: "Battery status update"
  },
  security: { 
    icon: Shield, 
    category: "warning", 
    label: "Security",
    description: "Security event"
  },
  timeout: { 
    icon: Timer, 
    category: "warning", 
    label: "Timeout",
    description: "Operation timed out"
  },
  // Command-related events
  sampling: { 
    icon: Timer, 
    category: "command", 
    label: "Sampling Rate",
    description: "Sampling rate changed"
  },
  led: { 
    icon: Zap, 
    category: "command", 
    label: "LED Control",
    description: "LED command sent"
  },
  blink: { 
    icon: Zap, 
    category: "command", 
    label: "LED Blink",
    description: "LED blink command"
  },
  buzzer: { 
    icon: Bell, 
    category: "command", 
    label: "Buzzer",
    description: "Buzzer command sent"
  },
  command: { 
    icon: Radio, 
    category: "command", 
    label: "Command",
    description: "Command sent to device"
  },
}

const categoryStyles: Record<EventCategory, { 
  bg: string
  border: string
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeText: string
}> = {
  success: { 
    bg: "bg-card hover:bg-neon-green/5", 
    border: "border-neon-green/30",
    iconBg: "bg-neon-green/15",
    iconColor: "text-neon-green",
    badgeBg: "bg-neon-green/15",
    badgeText: "text-neon-green"
  },
  warning: { 
    bg: "bg-card hover:bg-neon-orange/5", 
    border: "border-neon-orange/30",
    iconBg: "bg-neon-orange/15",
    iconColor: "text-neon-orange",
    badgeBg: "bg-neon-orange/15",
    badgeText: "text-neon-orange"
  },
  error: { 
    bg: "bg-card hover:bg-destructive/5", 
    border: "border-destructive/30",
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
    badgeBg: "bg-destructive/15",
    badgeText: "text-destructive"
  },
  heartbeat: { 
    bg: "bg-card hover:bg-neon-pink/5", 
    border: "border-neon-pink/30",
    iconBg: "bg-neon-pink/15",
    iconColor: "text-neon-pink",
    badgeBg: "bg-neon-pink/15",
    badgeText: "text-neon-pink"
  },
  command: { 
    bg: "bg-card hover:bg-tersano-teal/5", 
    border: "border-tersano-teal/30",
    iconBg: "bg-tersano-teal/15",
    iconColor: "text-tersano-teal",
    badgeBg: "bg-tersano-teal/15",
    badgeText: "text-tersano-teal"
  },
  system: { 
    bg: "bg-card hover:bg-neon-purple/5", 
    border: "border-neon-purple/30",
    iconBg: "bg-neon-purple/15",
    iconColor: "text-neon-purple",
    badgeBg: "bg-neon-purple/15",
    badgeText: "text-neon-purple"
  },
}

function getEventConfig(eventName: string): EventConfig {
  const normalized = eventName.toLowerCase()
  for (const [key, config] of Object.entries(eventConfigs)) {
    if (normalized.includes(key)) return config
  }
  // Default fallback
  return { 
    icon: Info, 
    category: "info", 
    label: eventName,
    description: "Device event"
  }
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function EventsList({
  events,
  maxHeight = "600px",
}: EventsListProps) {
  return (
    <Card className="shadow-sm">
      <ScrollArea style={{ height: maxHeight }} className="p-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="rounded-xl bg-muted p-5 mb-4">
              <Activity className="h-10 w-10 opacity-40" />
            </div>
            <p className="text-base font-medium">No events recorded</p>
            <p className="text-sm mt-2 text-center max-w-sm">
              Events will appear here when your devices report status changes, errors, or other activities.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const config = getEventConfig(event.event)
              const styles = categoryStyles[config.category]
              const Icon = config.icon
              
              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200",
                    styles.bg,
                    styles.border
                  )}
                >
                  {/* Icon */}
                  <div className={cn("rounded-lg p-2.5 flex-shrink-0", styles.iconBg)}>
                    <Icon className={cn("h-5 w-5", styles.iconColor)} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{config.label}</h3>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", styles.badgeBg, styles.badgeText)}>
                        {config.category.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {config.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{event.device_id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                      {event.uptime_ms !== null && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Uptime: {formatUptime(event.uptime_ms)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {format(new Date(event.created_at), "EEEE, MMMM d, yyyy 'at' h:mm:ss a")}
                    </p>
                    
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <details className="mt-3 group">
                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                          View metadata
                        </summary>
                        <pre className="mt-2 text-xs bg-muted/50 p-3 rounded-md overflow-x-auto font-mono border">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
