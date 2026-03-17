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
    <div className="min-h-screen bg-muted/30">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-5">
          {/* Page Header Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </CardContent>
          </Card>

          {/* Stats Summary - Clickable filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filterButtons.map(({ filter, label, count, icon: Icon }) => (
              <Card 
                key={filter}
                className={cn(
                  "shadow-sm cursor-pointer transition-all duration-200 overflow-hidden",
                  activeFilter === filter 
                    ? "ring-2 ring-offset-2 ring-offset-background" 
                    : "hover:shadow-md",
                  filter === "all" && activeFilter === "all" && "ring-foreground/50",
                  filter === "system" && activeFilter === "system" && "ring-neon-purple",
                  filter === "heartbeat" && activeFilter === "heartbeat" && "ring-neon-pink",
                  filter === "command" && activeFilter === "command" && "ring-tersano-teal"
                )}
                onClick={() => setActiveFilter(filter)}
              >
                <CardContent className="p-0">
                  <div className={cn(
                    "p-4 flex items-center gap-3",
                    filter === "system" && "bg-neon-purple/10",
                    filter === "heartbeat" && "bg-neon-pink/10",
                    filter === "command" && "bg-tersano-teal/10"
                  )}>
                    <div className={cn(
                      "p-2.5 rounded-lg",
                      filter === "all" && "bg-foreground/10 text-foreground",
                      filter === "system" && "bg-neon-purple text-white",
                      filter === "heartbeat" && "bg-neon-pink text-white",
                      filter === "command" && "bg-tersano-teal text-white"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "text-2xl font-bold",
                        filter === "system" && "text-neon-purple",
                        filter === "heartbeat" && "text-neon-pink",
                        filter === "command" && "text-tersano-teal"
                      )}>{count}</p>
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active filter indicator */}
          {activeFilter !== "all" && (
            <Card className="shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Filtering:</span>
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold",
                    activeFilter === "system" && "bg-neon-purple text-white",
                    activeFilter === "heartbeat" && "bg-neon-pink text-white",
                    activeFilter === "command" && "bg-tersano-teal text-white"
                  )}>
                    {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} events
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-3 text-xs"
                  onClick={() => setActiveFilter("all")}
                >
                  Clear
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          <EventsList events={filteredEvents} maxHeight="calc(100vh - 420px)" />
        </div>
      </main>
    </div>
  )
}
