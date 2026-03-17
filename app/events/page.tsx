"use client"

import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Power, Heart, Terminal } from "lucide-react"
import { useMemo } from "react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  // Compute stats by 3 categories: System, Heartbeat, Command
  const stats = useMemo(() => {
    const heartbeats = events.filter(e => 
      e.event.toLowerCase().includes("heartbeat")
    ).length
    
    const commands = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("command") || name.includes("sampling") || 
             name.includes("led") || name.includes("blink") || 
             name.includes("buzzer") || name.includes("config")
    }).length
    
    // System = everything else (boot, online, offline, warning, error, calibrated, etc.)
    const system = events.length - heartbeats - commands
    
    return { system, heartbeats, commands, total: events.length }
  }, [events])

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
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 self-start sm:self-auto"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Summary - 3 categories */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="shadow-sm border-neon-purple/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-purple/10">
                  <Power className="h-5 w-5 text-neon-purple" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-purple">{stats.system}</p>
                  <p className="text-xs text-muted-foreground">System</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-neon-pink/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-pink/10">
                  <Heart className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-pink">{stats.heartbeats}</p>
                  <p className="text-xs text-muted-foreground">Heartbeats</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-tersano-teal/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-tersano-teal/10">
                  <Terminal className="h-5 w-5 text-tersano-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tersano-teal">{stats.commands}</p>
                  <p className="text-xs text-muted-foreground">Commands</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <EventsList events={events} maxHeight="calc(100vh - 340px)" />
        </div>
      </main>
    </div>
  )
}
