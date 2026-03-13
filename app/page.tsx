"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { TelemetryChart } from "@/components/telemetry-chart"
import { ReadingsTable } from "@/components/readings-table"
import { TimeRangeSelect } from "@/components/time-range-select"
import { useTelemetry } from "@/hooks/use-telemetry"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { TimeRange } from "@/lib/types"
import { Thermometer, Droplets, Gauge, Battery, Clock, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const { selectedDevice } = useDevice()
  const { readings: realReadings, latestReading: realLatestReading } = useTelemetry(selectedDevice, timeRange)
  const { isDemoMode, demoReadings } = useDemoMode()

  // Use demo data when in demo mode
  const readings = isDemoMode ? demoReadings : realReadings
  const latestReading = isDemoMode ? demoReadings[demoReadings.length - 1] : realLatestReading

  const avgTemp = readings.length > 0
    ? readings.reduce((sum, r) => sum + (r.temperature_c ?? 0), 0) / readings.filter(r => r.temperature_c !== null).length
    : null

  const avgHumidity = readings.length > 0
    ? readings.reduce((sum, r) => sum + (r.humidity_pct ?? 0), 0) / readings.filter(r => r.humidity_pct !== null).length
    : null

  const uptimeStr = latestReading?.uptime_ms
    ? `${Math.floor(latestReading.uptime_ms / 1000 / 60 / 60)}h ${Math.floor((latestReading.uptime_ms / 1000 / 60) % 60)}m`
    : "--"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-tersano-teal via-neon-purple to-neon-pink bg-clip-text text-transparent">
                  Remote Telemetry Unit
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time environmental monitoring
              </p>
            </div>
            <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
          </div>

          {/* Primary Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Temperature"
              value={latestReading?.temperature_c?.toFixed(1) ?? "--"}
              unit="°C"
              icon={Thermometer}
              neonColor="cyan"
              trend={avgTemp && latestReading?.temperature_c ? (latestReading.temperature_c > avgTemp ? "up" : "down") : undefined}
              trendValue={avgTemp ? `Avg: ${avgTemp.toFixed(1)}°C` : undefined}
            />
            <StatCard
              title="Humidity"
              value={latestReading?.humidity_pct?.toFixed(1) ?? "--"}
              unit="%"
              icon={Droplets}
              neonColor="purple"
              trend={avgHumidity && latestReading?.humidity_pct ? (latestReading.humidity_pct > avgHumidity ? "up" : "down") : undefined}
              trendValue={avgHumidity ? `Avg: ${avgHumidity.toFixed(1)}%` : undefined}
            />
            <StatCard
              title="Pressure"
              value={latestReading?.pressure_hpa?.toFixed(0) ?? "--"}
              unit="hPa"
              icon={Gauge}
              neonColor="orange"
            />
            <StatCard
              title="Battery"
              value={latestReading?.battery_v?.toFixed(2) ?? "--"}
              unit="V"
              icon={Battery}
              neonColor="green"
              trend={latestReading?.battery_v ? (latestReading.battery_v > 3.3 ? "up" : "down") : undefined}
              trendValue={latestReading?.battery_v && latestReading.battery_v <= 3.3 ? "Low battery" : undefined}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Device Uptime"
              value={uptimeStr}
              icon={Clock}
              neonColor="pink"
            />
            <StatCard
              title="Total Readings"
              value={readings.length}
              icon={Activity}
              neonColor="cyan"
              trendValue={`In last ${timeRange}`}
              trend="neutral"
            />
            <StatCard
              title="Last Update"
              value={latestReading ? formatDistanceToNow(new Date(latestReading.created_at), { addSuffix: true }) : "--"}
              icon={Activity}
              neonColor="green"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TelemetryChart
              data={readings}
              dataKey="temperature_c"
              title="Temperature"
              description="Temperature readings over time"
              color="var(--tersano-teal)"
              unit="°C"
            />
            <TelemetryChart
              data={readings}
              dataKey="humidity_pct"
              title="Humidity"
              description="Humidity readings over time"
              color="var(--neon-purple)"
              unit="%"
            />
            <TelemetryChart
              data={readings}
              dataKey="pressure_hpa"
              title="Pressure"
              description="Atmospheric pressure readings"
              color="var(--neon-orange)"
              unit=" hPa"
            />
            <TelemetryChart
              data={readings}
              dataKey="battery_v"
              title="Battery Voltage"
              description="Battery level over time"
              color="var(--neon-green)"
              unit="V"
            />
          </div>

          {/* Readings Table */}
          <ReadingsTable
            readings={[...readings].reverse().slice(0, 20)}
            title="Recent Readings"
            description={`Latest telemetry data from ${selectedDevice || "device"}`}
          />
        </div>
      </main>
    </div>
  )
}
