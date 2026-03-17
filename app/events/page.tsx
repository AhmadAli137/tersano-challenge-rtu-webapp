"use client"

import { useState, useMemo } from "react"
import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { TimeRangeSelect } from "@/components/time-range-select"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { TimeRange } from "@/lib/types"
import { RefreshCw, Power, Heart, Terminal, ListFilter } from "lucide-react"
import { cn } from "@/lib/utils"

type EventFilter = "all" | "system" | "heartbeat" | "command"

export default function EventsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("15m")
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all")
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined, timeRange)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  // Categorize events
  const categorizeEvent = (eventName: string): "system" | "heartbeat" | "command" => {
    const name = eventName.toLowerCase()
    if (name === "heartbeat") return "heartbeat"
    if (name === "command_applied" || name === "command_failed") return "command"
    return "system"
  }

  // Compute stats by 3 categories: System, Heartbeat, Command
  const stats = useMemo(() => {
    const heartbeats = events.filter(e => categorizeEvent(e.event) === "heartbeat").length
    const commands = events.filter(e => categorizeEvent(e.event) === "command").length
    const system = events.length - heartbeats - commands
    
    return { system, heartbeats, commands, total: events.length }
  }, [events])

  // Filter events based on active filter
  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return events
    return events.filter(e => categorizeEvent(e.event) === activeFilter)
  }, [events, activeFilter])

  const filters: { filter: EventFilter; label: string; count: number; icon: typeof Power; activeClass: string }[] = [
    { filter: "all", label: "All", count: stats.total, icon: ListFilter, activeClass: "bg-foreground text-background" },
    { filter: "system", label: "System", count: stats.system, icon: Power, activeClass: "bg-neon-purple text-white" },
    { filter: "heartbeat", label: "Heartbeat", count: stats.heartbeats, icon: Heart, activeClass: "bg-neon-pink text-white" },
    { filter: "command", label: "Command", count: stats.commands, icon: Terminal, activeClass: "bg-tersano-teal text-white" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-4">
          {/* Page Header - Compact */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Events</h1>
              <p className="text-sm text-muted-foreground">
                Device activity and status updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Compact Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(({ filter, label, count, icon: Icon, activeClass }) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeFilter === filter
                    ? activeClass
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                <span className={cn(
                  "ml-0.5 text-xs px-1.5 py-0.5 rounded-full",
                  activeFilter === filter ? "bg-white/20" : "bg-background"
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Events List */}
          <EventsList events={filteredEvents} maxHeight="calc(100vh - 240px)" />
        </div>
      </main>
    </div>
  )
}
