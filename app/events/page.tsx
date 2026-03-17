"use client"

import { useState, useMemo } from "react"
import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { TimeRangeSelect } from "@/components/time-range-select"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TimeRange } from "@/lib/types"
import { RefreshCw, Power, Heart, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

type EventFilter = "all" | "system" | "heartbeat" | "command"

export default function EventsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
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

  const filterButtons: { filter: EventFilter; label: string; count: number; color: string; icon: typeof Power }[] = [
    { filter: "all", label: "All", count: stats.total, color: "bg-muted text-foreground", icon: Power },
    { filter: "system", label: "System", count: stats.system, color: "bg-neon-purple/15 text-neon-purple border-neon-purple/30", icon: Power },
    { filter: "heartbeat", label: "Heartbeat", count: stats.heartbeats, color: "bg-neon-pink/15 text-neon-pink border-neon-pink/30", icon: Heart },
    { filter: "command", label: "Command", count: stats.commands, color: "bg-tersano-teal/15 text-tersano-teal border-tersano-teal/30", icon: Terminal },
  ]

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Events</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Device activity and status updates
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Summary - Clickable filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filterButtons.map(({ filter, label, count, color, icon: Icon }) => (
              <Card 
                key={filter}
                className={cn(
                  "shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
                  activeFilter === filter 
                    ? "ring-2 ring-tersano-teal ring-offset-2 ring-offset-background" 
                    : "hover:scale-[1.02]",
                  filter === "system" && "border-neon-purple/20",
                  filter === "heartbeat" && "border-neon-pink/20",
                  filter === "command" && "border-tersano-teal/20"
                )}
                onClick={() => setActiveFilter(filter)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-2xl font-bold",
                      filter === "system" && "text-neon-purple",
                      filter === "heartbeat" && "text-neon-pink",
                      filter === "command" && "text-tersano-teal"
                    )}>{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active filter indicator */}
          {activeFilter !== "all" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing:</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                activeFilter === "system" && "bg-neon-purple/15 text-neon-purple",
                activeFilter === "heartbeat" && "bg-neon-pink/15 text-neon-pink",
                activeFilter === "command" && "bg-tersano-teal/15 text-tersano-teal"
              )}>
                {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} events
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setActiveFilter("all")}
              >
                Clear filter
              </Button>
            </div>
          )}

          {/* Events List */}
          <EventsList events={filteredEvents} maxHeight="calc(100vh - 400px)" />
        </div>
      </main>
    </div>
  )
}
