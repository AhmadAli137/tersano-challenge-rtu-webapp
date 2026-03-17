"use client"

import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Activity, RefreshCw } from "lucide-react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Events</h1>
              <p className="text-sm text-muted-foreground">
                Real-time status updates and system events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{events.length} events</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Events List */}
          <EventsList events={events} maxHeight="calc(100vh - 200px)" />
        </div>
      </main>
    </div>
  )
}
