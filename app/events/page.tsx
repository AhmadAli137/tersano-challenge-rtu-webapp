"use client"

import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"
import { useMemo } from "react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  // Compute event stats
  const stats = useMemo(() => {
    const success = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("online") || name.includes("connect") || name.includes("calibrat")
    }).length
    
    const warnings = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("warning") || name.includes("reset") || name.includes("battery") || name.includes("timeout")
    }).length
    
    const errors = events.filter(e => {
      const name = e.event.toLowerCase()
      return name.includes("error") || name.includes("offline") || name.includes("disconnect")
    }).length
    
    const info = events.length - success - warnings - errors
    
    return { success, warnings, errors, info, total: events.length }
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
                Real-time status updates and system events from your devices
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
                  <CheckCircle2 className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-green">{stats.success}</p>
                  <p className="text-xs text-muted-foreground">Success</p>
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
            
            <Card className="shadow-sm border-destructive/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-tersano-teal/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-tersano-teal/10">
                  <Info className="h-5 w-5 text-tersano-teal" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tersano-teal">{stats.info}</p>
                  <p className="text-xs text-muted-foreground">Info</p>
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
