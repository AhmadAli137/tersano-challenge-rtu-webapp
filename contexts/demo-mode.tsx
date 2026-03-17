"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { TelemetryRow, DeviceEvent } from "@/lib/types"

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
  demoReadings: TelemetryRow[]
  demoEvents: DeviceEvent[]
  demoDeviceIds: string[]
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

function generateDemoData(): { readings: TelemetryRow[]; events: DeviceEvent[] } {
  const now = new Date()
  const readings: TelemetryRow[] = []
  const events: DeviceEvent[] = []

  // Generate 120 readings (last 2 hours at 1-minute intervals)
  // Simulate an offline period from index 100-110 where data was cached (recent ~10-20 min ago)
  const offlineStart = 100
  const offlineEnd = 110
  
  for (let i = 0; i < 120; i++) {
    const timestamp = new Date(now.getTime() - (119 - i) * 60 * 1000)
    const baseTemp = 22 + Math.sin(i * 0.1) * 3
    const baseHumidity = 55 + Math.cos(i * 0.08) * 10
    
    // Simulate cached data during the offline period
    const wasCached = i >= offlineStart && i <= offlineEnd
    const capturedUptimeMs = i * 60000
    // If cached, it was published later when device came back online (around index 65)
    const publishedUptimeMs = wasCached ? (65 * 60000) + ((i - offlineStart) * 500) : capturedUptimeMs
    
    readings.push({
      id: `demo-reading-${i}`,
      device_id: "tersano-rtu-demo",
      seq: i + 1,
      uptime_ms: i * 60000,
      temperature_c: Number((baseTemp + (Math.random() - 0.5) * 2).toFixed(2)),
      humidity_pct: Number((baseHumidity + (Math.random() - 0.5) * 5).toFixed(2)),
      pressure_hpa: Number((1013 + Math.sin(i * 0.05) * 5 + (Math.random() - 0.5) * 2).toFixed(2)),
      battery_v: Number((4.15 - i * 0.002 + (Math.random() - 0.5) * 0.03).toFixed(2)),
      sensor_ok: Math.random() > 0.02,
      created_at: timestamp.toISOString(),
      captured_uptime_ms: capturedUptimeMs,
      published_uptime_ms: publishedUptimeMs,
      was_cached: wasCached,
    })
  }

  // Generate some device events
  const eventTypes = [
    { event: "boot", metadata: { firmware: "2.1.0", reason: "scheduled_restart" } },
    { event: "online", metadata: { ip: "192.168.1.105", rssi: -42 } },
    { event: "calibrated", metadata: { sensors: ["temp", "humidity", "pressure"] } },
    { event: "heartbeat", metadata: { status: "healthy", memory_free: 45632 } },
    { event: "data_sync", metadata: { records: 24, duration_ms: 1250 } },
  ]

  for (let i = 0; i < 10; i++) {
    const eventType = eventTypes[i % eventTypes.length]
    const timestamp = new Date(now.getTime() - (9 - i) * 12 * 60 * 1000)
    
    events.push({
      id: `demo-event-${i}`,
      device_id: "tersano-rtu-demo",
      event: eventType.event,
      uptime_ms: i * 720000,
      metadata: eventType.metadata,
      created_at: timestamp.toISOString(),
    })
  }

  return { readings, events }
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoData, setDemoData] = useState<{ readings: TelemetryRow[]; events: DeviceEvent[] }>({
    readings: [],
    events: [],
  })

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => !prev)
  }, [])

  // Generate fresh demo data when demo mode is enabled
  useEffect(() => {
    if (isDemoMode) {
      setDemoData(generateDemoData())
      
      // Update data every 5 seconds in demo mode
      const interval = setInterval(() => {
        setDemoData((prev) => {
          const uptimeMs = prev.readings.length * 60000
          const newReading: TelemetryRow = {
            id: `demo-reading-${Date.now()}`,
            device_id: "tersano-rtu-demo",
            seq: prev.readings.length + 1,
            uptime_ms: uptimeMs,
            temperature_c: Number((22 + Math.sin(prev.readings.length * 0.1) * 3 + (Math.random() - 0.5) * 2).toFixed(2)),
            humidity_pct: Number((55 + Math.cos(prev.readings.length * 0.08) * 10 + (Math.random() - 0.5) * 5).toFixed(2)),
            pressure_hpa: Number((1013 + Math.sin(prev.readings.length * 0.05) * 5 + (Math.random() - 0.5) * 2).toFixed(2)),
            battery_v: Number((4.15 - prev.readings.length * 0.002 + (Math.random() - 0.5) * 0.03).toFixed(2)),
            sensor_ok: true,
            created_at: new Date().toISOString(),
            captured_uptime_ms: uptimeMs,
            published_uptime_ms: uptimeMs,
            was_cached: false,
          }
          
          return {
            ...prev,
            readings: [...prev.readings.slice(-119), newReading],
          }
        })
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isDemoMode])

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        demoReadings: demoData.readings,
        demoEvents: demoData.events,
        demoDeviceIds: isDemoMode ? ["tersano-rtu-demo"] : [],
      }}
    >
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider")
  }
  return context
}
