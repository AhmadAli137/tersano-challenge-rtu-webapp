"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { DeviceStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { 
  Activity, 
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
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Thermometer,
  Signal
} from "lucide-react"

interface EventsListProps {
  events: DeviceStatus[]
  maxHeight?: string
}

type EventCategory = "system" | "heartbeat" | "command"

interface EventConfig {
  icon: typeof Activity
  category: EventCategory
  label: string
}

const eventConfigs: Record<string, EventConfig> = {
  boot: { icon: Power, category: "system", label: "Device Boot" },
  rtu_started: { icon: Play, category: "system", label: "RTU Started" },
  calibrated: { icon: CheckCircle2, category: "system", label: "Calibrated" },
  online: { icon: Wifi, category: "system", label: "Online" },
  offline: { icon: WifiOff, category: "system", label: "Offline" },
  warning: { icon: AlertTriangle, category: "system", label: "Warning" },
  cloud_degraded: { icon: CloudOff, category: "system", label: "Cloud Degraded" },
  cloud_recovered: { icon: Cloud, category: "system", label: "Cloud Recovered" },
  data_sync: { icon: Database, category: "system", label: "Data Sync" },
  heartbeat: { icon: Heart, category: "heartbeat", label: "Heartbeat" },
  command_applied: { icon: CheckCircle2, category: "command", label: "Command" },
  command_failed: { icon: XCircle, category: "command", label: "Command Failed" },
}

// Warning type icons for specific warning metadata
const warningTypeConfig: Record<string, { icon: typeof AlertTriangle; label: string }> = {
  low_battery: { icon: Battery, label: "Low Battery" },
  temperature: { icon: Thermometer, label: "Temperature Warning" },
  signal: { icon: Signal, label: "Signal Warning" },
}

const commandTypeConfig: Record<string, { icon: typeof Timer; label: string; formatValue?: (v: unknown) => string }> = {
  set_sampling_rate: { 
    icon: Gauge, 
    label: "Sampling Rate",
    formatValue: (v) => `set to ${v}ms`
  },
  led_on: { icon: Lightbulb, label: "LED On" },
  led_off: { icon: Lightbulb, label: "LED Off" },
  led_blink: { 
    icon: Lightbulb, 
    label: "LED Blink",
    formatValue: (v) => {
      if (typeof v === 'object' && v) {
        const obj = v as Record<string, unknown>
        return obj.count ? `${obj.count}x` : ''
      }
      return ''
    }
  },
  buzzer_on: { icon: Volume2, label: "Buzzer On" },
  buzzer_off: { icon: Volume2, label: "Buzzer Off" },
  buzzer_beep: { 
    icon: Volume2, 
    label: "Buzzer Beep",
    formatValue: (v) => {
      if (typeof v === 'object' && v) {
        const obj = v as Record<string, unknown>
        return obj.duration_ms ? `${obj.duration_ms}ms` : ''
      }
      return ''
    }
  },
}

function getCommandInfo(metadata: Record<string, unknown> | null): { type: string; value?: unknown } | null {
  if (!metadata) return null
  if (metadata.command && typeof metadata.command === 'object') {
    const cmd = metadata.command as Record<string, unknown>
    if (cmd.type) return { type: String(cmd.type), value: cmd.value ?? cmd }
  }
  if (metadata.type) return { type: String(metadata.type), value: metadata.value ?? metadata }
  for (const key of Object.keys(commandTypeConfig)) {
    if (metadata[key] !== undefined) return { type: key, value: metadata[key] }
  }
  return null
}

const categoryColors: Record<EventCategory, { bg: string; text: string; dot: string }> = {
  system: { bg: "bg-neon-purple/10", text: "text-neon-purple", dot: "bg-neon-purple" },
  heartbeat: { bg: "bg-neon-pink/10", text: "text-neon-pink", dot: "bg-neon-pink" },
  command: { bg: "bg-tersano-teal/10", text: "text-tersano-teal", dot: "bg-tersano-teal" },
}

function getEventConfig(eventName: string): EventConfig {
  const normalized = eventName.toLowerCase()
  for (const [key, config] of Object.entries(eventConfigs)) {
    if (normalized.includes(key)) return config
  }
  return { icon: Info, category: "system", label: eventName }
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
          </div>
        ) : (
          <div className="divide-y">
            {events.map((event) => {
              const config = getEventConfig(event.event)
              const colors = categoryColors[config.category]
              const isCommand = config.category === "command"
              const isFailed = event.event === "command_failed"
              const isWarning = event.event === "warning"
              const meta = event.metadata as Record<string, unknown> | null
              
              // Get command-specific info
              const cmdInfo = isCommand ? getCommandInfo(meta) : null
              const cmdConfig = cmdInfo?.type ? commandTypeConfig[cmdInfo.type] : null
              
              // Get warning-specific info
              const warningType = isWarning && meta?.type ? String(meta.type) : null
              const warningConfig = warningType ? warningTypeConfig[warningType] : null
              
              // Determine icon and label based on event type
              let Icon = config.icon
              let label = config.label
              let detail = ""
              
              if (cmdConfig) {
                Icon = cmdConfig.icon
                label = cmdConfig.label
                if (cmdConfig.formatValue && cmdInfo?.value) {
                  detail = cmdConfig.formatValue(cmdInfo.value)
                }
              } else if (warningConfig) {
                Icon = warningConfig.icon
                label = warningConfig.label
                if (meta?.level !== undefined) {
                  detail = `${meta.level}V`
                }
              } else if (event.event === "online" && meta) {
                if (meta.ip) detail = String(meta.ip)
                if (meta.rssi) detail += detail ? ` (${meta.rssi}dBm)` : `${meta.rssi}dBm`
              } else if (event.event === "boot" && meta) {
                if (meta.firmware) detail = `v${meta.firmware}`
                if (meta.reason) detail += detail ? ` - ${meta.reason}` : String(meta.reason)
              } else if (event.event === "calibrated" && meta?.sensors) {
                const sensors = meta.sensors as string[]
                detail = sensors.join(", ")
              }

              return (
                <div key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className={cn("rounded-lg p-2 flex-shrink-0", colors.bg)}>
                    <Icon className={cn("h-4 w-4", colors.text)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{label}</span>
                      {detail && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {detail}
                        </span>
                      )}
                      {isCommand && (
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                          isFailed 
                            ? "bg-destructive/15 text-destructive" 
                            : "bg-neon-green/15 text-neon-green"
                        )}>
                          {isFailed ? "FAILED" : "OK"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono text-[11px]">{event.device_id}</span>
                      {event.uptime_ms !== null && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatUptime(event.uptime_ms)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", colors.dot)} />
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
