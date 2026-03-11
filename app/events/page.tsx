"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { EventsList } from "@/components/events-list"
import { DeviceSelector } from "@/components/device-selector"
import { useEvents } from "@/hooks/use-events"
import { useDeviceIds } from "@/hooks/use-telemetry"
import { useDemoMode } from "@/contexts/demo-mode"
import { DeviceInfo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function EventsPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const { deviceIds: realDeviceIds } = useDeviceIds()
  const { events: realEvents, isLoading, refresh } = useEvents(selectedDevice || undefined)
  const { isDemoMode, demoDeviceIds, demoEvents } = useDemoMode()
  
  const deviceIds = isDemoMode ? demoDeviceIds : realDeviceIds
  const events = isDemoMode ? demoEvents : realEvents

  // Auto-select first device or show all
  useEffect(() => {
    if (deviceIds.length > 0 && !selectedDevice) {
      // Show all events by default (empty string)
    }
  }, [deviceIds, selectedDevice])

  const devices: DeviceInfo[] = [
    { id: "", name: "All Devices", isOnline: true, lastSeen: null },
    ...deviceIds.map((id) => ({
      id,
      name: id,
      isOnline: true,
      lastSeen: null,
    })),
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Device Events</h1>
              <p className="text-muted-foreground">
                Monitor device status changes and system events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DeviceSelector
                devices={devices}
                value={selectedDevice}
                onChange={setSelectedDevice}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => refresh()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
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
