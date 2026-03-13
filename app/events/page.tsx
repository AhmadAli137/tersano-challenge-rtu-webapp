"use client"

import { Header } from "@/components/header"
import { EventsList } from "@/components/events-list"
import { useEvents } from "@/hooks/use-events"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  
  const events = isDemoMode ? demoEvents : realEvents

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-border/50">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Device Events</h1>
              <p className="text-sm text-muted-foreground">
                Monitor device status and system events
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Events List */}
          <EventsList
            events={events}
            title={selectedDevice ? `Events for ${selectedDevice}` : "All Device Events"}
            description="Real-time device status updates and system events"
            maxHeight="600px"
          />
        </div>
      </main>
    </div>
  )
}
