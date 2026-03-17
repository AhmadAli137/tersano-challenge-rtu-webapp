"use client"

import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Wifi, AlertTriangle, Power, Settings } from "lucide-react"
import { useMemo } from "react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  // Compute stats by category based on actual event types: boot, online, warning, calibrated
  const stats = useMemo(() => {
    const online = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("online") || name.includes("connect")
    }).length
    const warnings = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("warning") || name.includes("error") || name.includes("offline")
    }).length
    const system = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("boot") || name.includes("reset")
    }).length
    const calibrated = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("calibrat")
    }).length
    
    return { online, warnings, system, calibrated, total: events.length }
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

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="shadow-sm border-neon-green/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-green/10">
                  <Wifi className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-green">{stats.online}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-neon-orange/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-orange/10">
                  <AlertTriangle className="h-5 w-5 text-neon-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-orange">{stats.warnings}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </CardContent>
            </Card>
            
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
            
            <Card className="shadow-sm border-tersano-teal/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-tersano-teal/10">
                  <Settings className="h-5 w-5 text-tersano-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tersano-teal">{stats.calibrated}</p>
                  <p className="text-xs text-muted-foreground">Calibrated</p>
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
