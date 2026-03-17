"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeviceStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { 
  Activity, 
  CheckCircle2, 
  Info, 
  Power, 
  Play, 
  Wifi, 
  WifiOff, 
  Clock,
  Heart,
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
}

const eventConfigs: Record<string, EventConfig> = {
  // System events
  boot: { icon: Power, category: "system", label: "Device Boot" },
  rtu_started: { icon: Play, category: "system", label: "RTU Started" },
  calibrated: { icon: CheckCircle2, category: "system", label: "Calibrated" },
  online: { icon: Wifi, category: "system", label: "Online" },
  offline: { icon: WifiOff, category: "system", label: "Offline" },
  cloud_degraded: { icon: CloudOff, category: "system", label: "Cloud Degraded" },
  cloud_recovered: { icon: Cloud, category: "system", label: "Cloud Recovered" },
  data_sync: { icon: Database, category: "system", label: "Data Sync" },
  // Heartbeat
  heartbeat: { icon: Heart, category: "heartbeat", label: "Heartbeat" },
  // Commands - these get overridden by specific command type
  command_applied: { icon: CheckCircle2, category: "command", label: "Command Applied" },
  command_failed: { icon: XCircle, category: "command", label: "Command Failed" },
}

// Command type display config
const commandTypeDisplay: Record<string, { icon: typeof Timer; label: string }> = {
  set_sampling_interval: { icon: Gauge, label: "Sampling Rate" },
  set_sampling_rate: { icon: Gauge, label: "Sampling Rate" },
  set_buzzer: { icon: Volume2, label: "Buzzer" },
  buzzer_on: { icon: Volume2, label: "Buzzer On" },
  buzzer_off: { icon: Volume2, label: "Buzzer Off" },
  buzzer_beep: { icon: Volume2, label: "Buzzer Beep" },
  led_on: { icon: Lightbulb, label: "LED On" },
  led_off: { icon: Lightbulb, label: "LED Off" },
  led_blink: { icon: Lightbulb, label: "LED Blink" },
}

const categoryStyles: Record<EventCategory, { 
  bg: string
  border: string
  iconBg: string
  iconColor: string
  dot: string
}> = {
  system: { 
    bg: "hover:bg-neon-purple/5", 
    border: "border-l-neon-purple",
    iconBg: "bg-neon-purple/10",
    iconColor: "text-neon-purple",
    dot: "bg-neon-purple"
  },
  heartbeat: { 
    bg: "hover:bg-neon-pink/5", 
    border: "border-l-neon-pink",
    iconBg: "bg-neon-pink/10",
    iconColor: "text-neon-pink",
    dot: "bg-neon-pink"
  },
  command: { 
    bg: "hover:bg-tersano-teal/5", 
    border: "border-l-tersano-teal",
    iconBg: "bg-tersano-teal/10",
    iconColor: "text-tersano-teal",
    dot: "bg-tersano-teal"
  },
}

function getEventConfig(eventName: string): EventConfig {
  const normalized = eventName.toLowerCase()
  for (const [key, config] of Object.entries(eventConfigs)) {
    if (normalized.includes(key)) return config
  }
  return { icon: Info, category: "system", label: eventName }
}

// Extract command details from metadata
function getCommandDetails(event: DeviceStatus): { 
  icon: typeof Timer
  label: string
  value?: string
  success: boolean
} | null {
  if (!event.event.toLowerCase().includes("command")) return null
  
  const success = event.event === "command_applied"
  const metadata = event.metadata as Record<string, unknown> | null
  
  // Try different metadata structures
  const cmd = metadata?.cmd || metadata?.command || metadata
  const cmdType = (cmd as Record<string, unknown>)?.type as string | undefined
  
  if (cmdType && commandTypeDisplay[cmdType]) {
    const display = commandTypeDisplay[cmdType]
    let value: string | undefined
    
    // Extract value based on command type
    if (cmdType.includes("sampling")) {
      const interval = (cmd as Record<string, unknown>)?.sampling_interval_ms || 
                       (cmd as Record<string, unknown>)?.value
      if (interval) value = `${interval}ms`
    } else if (cmdType.includes("buzzer")) {
      const buzzerOn = (cmd as Record<string, unknown>)?.buzzer_on
      if (buzzerOn !== undefined) value = buzzerOn ? "On" : "Off"
    }
    
    return { icon: display.icon, label: display.label, value, success }
  }
  
  // Fallback - try to detect command type from other fields
  if (metadata?.sampling_interval_ms !== undefined) {
    return { 
      icon: Gauge, 
      label: "Sampling Rate", 
      value: `${metadata.sampling_interval_ms}ms`,
      success 
    }
  }
  if (metadata?.buzzer_on !== undefined) {
    return { 
      icon: Volume2, 
      label: "Buzzer", 
      value: metadata.buzzer_on ? "On" : "Off",
      success 
    }
  }
  
  return { icon: CheckCircle2, label: "Command", success }
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

export function EventsList({ events, maxHeight = "600px" }: EventsListProps) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <ScrollArea style={{ height: maxHeight }}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Activity className="h-8 w-8 opacity-30 mb-3" />
            <p className="text-sm font-medium">No events found</p>
            <p className="text-xs mt-1">Events will appear here when devices report activity</p>
          </div>
        ) : (
          <div className="divide-y">
            {events.map((event) => {
              const config = getEventConfig(event.event)
              const styles = categoryStyles[config.category]
              const commandDetails = getCommandDetails(event)
              
              // Use command-specific display if available
              const Icon = commandDetails?.icon || config.icon
              const displayLabel = commandDetails?.label || config.label
              
              return (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 border-l-3 transition-colors",
                    styles.bg,
                    styles.border
                  )}
                >
                  {/* Icon */}
                  <div className={cn("rounded-md p-2 flex-shrink-0", styles.iconBg)}>
                    <Icon className={cn("h-4 w-4", styles.iconColor)} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{displayLabel}</span>
                      {commandDetails?.value && (
                        <Badge variant="secondary" className="text-[10px] h-5 font-mono">
                          {commandDetails.value}
                        </Badge>
                      )}
                      {commandDetails && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5",
                            commandDetails.success 
                              ? "bg-neon-green/10 text-neon-green border-neon-green/30" 
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          )}
                        >
                          {commandDetails.success ? "Applied" : "Failed"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="font-mono">{event.device_id}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                      {event.uptime_ms !== null && (
                        <span>Uptime: {formatUptime(event.uptime_ms)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-[10px] text-muted-foreground/60 text-right hidden sm:block">
                    {format(new Date(event.created_at), "MMM d, h:mm a")}
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
