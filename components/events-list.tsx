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
  Play, 
  Wifi, 
  WifiOff, 
  Clock,
  Zap,
  Heart,
  Settings,
  Bell,
  Volume2,
  Cloud,
  CloudOff,
  Timer,
  Gauge,
  Database,
  XCircle,
  Lightbulb
} from "lucide-react"

interface EventsListProps {
  events: DeviceStatus[]
  maxHeight?: string
}

// 3 main categories: System (purple), Heartbeat (pink), Command (teal)
type EventCategory = "system" | "heartbeat" | "command"

interface EventConfig {
  icon: typeof Activity
  category: EventCategory
  label: string
  description: string
}

const eventConfigs: Record<string, EventConfig> = {
  // ===== SYSTEM EVENTS (purple) =====
  boot: { 
    icon: Power, 
    category: "system", 
    label: "Device Boot",
    description: "Device booted and RTU startup began"
  },
  rtu_started: { 
    icon: Play, 
    category: "system", 
    label: "RTU Started",
    description: "RTU initialization completed and background tasks started"
  },
  calibrated: { 
    icon: CheckCircle2, 
    category: "system", 
    label: "Calibrated",
    description: "First valid sensor sample observed, sensor ready"
  },
  online: { 
    icon: Wifi, 
    category: "system", 
    label: "Online",
    description: "Wi-Fi connected and IP acquired"
  },
  offline: { 
    icon: WifiOff, 
    category: "system", 
    label: "Offline",
    description: "Wi-Fi disconnected"
  },
  cloud_degraded: { 
    icon: CloudOff, 
    category: "system", 
    label: "Cloud Degraded",
    description: "Cloud path degraded due to publish failures"
  },
  cloud_recovered: { 
    icon: Cloud, 
    category: "system", 
    label: "Cloud Recovered",
    description: "Cloud path recovered from degraded to healthy"
  },
  data_sync: { 
    icon: Database, 
    category: "system", 
    label: "Data Sync",
    description: "Backlog replay summary during catch-up"
  },
  
  // ===== HEARTBEAT EVENTS (pink) =====
  heartbeat: { 
    icon: Heart, 
    category: "heartbeat", 
    label: "Heartbeat",
    description: "Periodic device health status check-in"
  },
  
  // ===== COMMAND EVENTS (teal) =====
  command_applied: { 
    icon: CheckCircle2, 
    category: "command", 
    label: "Command Applied",
    description: "Command accepted and successfully applied"
  },
  command_failed: { 
    icon: XCircle, 
    category: "command", 
    label: "Command Failed",
    description: "Command received but rejected or failed"
  },
}

// Command type icons and labels for descriptive display
const commandTypeConfig: Record<string, { icon: typeof Timer; label: string; description: string }> = {
  set_sampling_rate: { 
    icon: Gauge, 
    label: "Sampling Rate Changed",
    description: "Device sampling interval updated"
  },
  led_on: { 
    icon: Lightbulb, 
    label: "LED Turned On",
    description: "LED indicator activated"
  },
  led_off: { 
    icon: Lightbulb, 
    label: "LED Turned Off",
    description: "LED indicator deactivated"
  },
  led_blink: { 
    icon: Lightbulb, 
    label: "LED Blink",
    description: "LED set to blink pattern"
  },
  buzzer_on: { 
    icon: Volume2, 
    label: "Buzzer Activated",
    description: "Buzzer turned on"
  },
  buzzer_off: { 
    icon: Volume2, 
    label: "Buzzer Deactivated",
    description: "Buzzer turned off"
  },
  buzzer_beep: { 
    icon: Volume2, 
    label: "Buzzer Beep",
    description: "Single buzzer beep triggered"
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
  system: { 
    bg: "bg-card hover:bg-neon-purple/5", 
    border: "border-neon-purple/30",
    iconBg: "bg-neon-purple/15",
    iconColor: "text-neon-purple",
    badgeBg: "bg-neon-purple/15",
    badgeText: "text-neon-purple"
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
}

function getEventConfig(eventName: string): EventConfig {
  const normalized = eventName.toLowerCase()
  for (const [key, config] of Object.entries(eventConfigs)) {
    if (normalized.includes(key)) return config
  }
  // Default fallback - use system category
  return { 
    icon: Info, 
    category: "system", 
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
              
              // For command events, get specific command info from metadata
              const isCommand = config.category === "command"
              const commandType = isCommand && event.metadata?.command?.type 
                ? String(event.metadata.command.type) 
                : null
              const commandConfig = commandType ? commandTypeConfig[commandType] : null
              
              // Use command-specific icon and label if available
              const Icon = commandConfig?.icon || config.icon
              const displayLabel = commandConfig?.label || config.label
              const displayDescription = commandConfig?.description || config.description
              
              // Get command value for display (e.g., sampling rate value)
              const commandValue = isCommand && event.metadata?.command?.value !== undefined
                ? event.metadata.command.value
                : null
              
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
                      <h3 className="font-semibold text-sm">{displayLabel}</h3>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-medium", styles.badgeBg, styles.badgeText)}>
                        {config.category.toUpperCase()}
                      </Badge>
                      {/* Show success/failed status for commands */}
                      {isCommand && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-5 font-medium",
                            event.event === "command_applied" 
                              ? "bg-neon-green/15 text-neon-green border-neon-green/30" 
                              : "bg-destructive/15 text-destructive border-destructive/30"
                          )}
                        >
                          {event.event === "command_applied" ? "SUCCESS" : "FAILED"}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {displayDescription}
                      {commandValue !== null && (
                        <span className="ml-1 font-semibold text-foreground">
                          {commandType === "set_sampling_rate" ? `${commandValue}ms` : String(commandValue)}
                        </span>
                      )}
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
