"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"
import { 
  Activity,
  Clock,
  Timer,
  Lightbulb,
  Volume2,
  Settings,
  Send,
  CheckCircle2,
  Loader2,
  Terminal
} from "lucide-react"

interface Command {
  id: string
  device_id: string
  command: {
    type: string
    sampling_interval_ms?: number
    buzzer_on?: boolean
    buzzer_frequency?: number
    enabled?: boolean
    [key: string]: unknown
  }
  processed: boolean
  created_at: string
}

interface CommandsListProps {
  commands: Command[]
  maxHeight?: string
}

function getCommandConfig(command: Command["command"]) {
  const type = command.type || "unknown"
  
  switch (type) {
    case "set_sampling_interval":
      const interval = command.sampling_interval_ms
      let intervalLabel = "Unknown"
      if (interval) {
        if (interval >= 60000) {
          intervalLabel = `${interval / 60000}m`
        } else {
          intervalLabel = `${interval / 1000}s`
        }
      }
      return {
        icon: Timer,
        label: "Set Sampling Rate",
        description: `Changed sampling interval to ${intervalLabel}`,
        color: "tersano-teal"
      }
    case "set_buzzer":
      return {
        icon: Volume2,
        label: "Buzzer Control",
        description: command.buzzer_on 
          ? `Playing tone at ${command.buzzer_frequency || 1000}Hz` 
          : "Buzzer turned off",
        color: "neon-purple"
      }
    case "toggle_led_blink":
      return {
        icon: Lightbulb,
        label: "LED Control",
        description: command.enabled ? "LED blinking enabled" : "LED blinking disabled",
        color: "neon-orange"
      }
    default:
      return {
        icon: Settings,
        label: type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        description: "Custom command",
        color: "muted-foreground"
      }
  }
}

const colorStyles: Record<string, { iconBg: string; iconColor: string; border: string }> = {
  "tersano-teal": {
    iconBg: "bg-tersano-teal/15",
    iconColor: "text-tersano-teal",
    border: "border-tersano-teal/30"
  },
  "neon-purple": {
    iconBg: "bg-neon-purple/15",
    iconColor: "text-neon-purple",
    border: "border-neon-purple/30"
  },
  "neon-orange": {
    iconBg: "bg-neon-orange/15",
    iconColor: "text-neon-orange",
    border: "border-neon-orange/30"
  },
  "muted-foreground": {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    border: "border-border"
  }
}

export function CommandsList({
  commands,
  maxHeight = "600px",
}: CommandsListProps) {
  return (
    <Card className="shadow-sm">
      <ScrollArea style={{ height: maxHeight }} className="p-4">
        {commands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="rounded-xl bg-muted p-5 mb-4">
              <Terminal className="h-10 w-10 opacity-40" />
            </div>
            <p className="text-base font-medium">No commands sent</p>
            <p className="text-sm mt-2 text-center max-w-sm">
              Commands will appear here when you control your devices from the Control Panel.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {commands.map((cmd) => {
              const config = getCommandConfig(cmd.command)
              const styles = colorStyles[config.color]
              const Icon = config.icon
              
              return (
                <div
                  key={cmd.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border bg-card transition-all duration-200 hover:bg-muted/30",
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
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-5 font-medium",
                          cmd.processed 
                            ? "bg-neon-green/15 text-neon-green border-neon-green/30" 
                            : "bg-neon-orange/15 text-neon-orange border-neon-orange/30"
                        )}
                      >
                        {cmd.processed ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />PROCESSED</>
                        ) : (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" />PENDING</>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {config.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{cmd.device_id}</span>
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        Sent
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(cmd.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {format(new Date(cmd.created_at), "EEEE, MMMM d, yyyy 'at' h:mm:ss a")}
                    </p>
                    
                    <details className="mt-3 group">
                      <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                        View payload
                      </summary>
                      <pre className="mt-2 text-xs bg-muted/50 p-3 rounded-md overflow-x-auto font-mono border">
                        {JSON.stringify(cmd.command, null, 2)}
                      </pre>
                    </details>
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
