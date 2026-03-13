"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { TelemetryChart } from "@/components/telemetry-chart"
import { ReadingsTable } from "@/components/readings-table"
import { TimeRangeSelect } from "@/components/time-range-select"
import { DeviceSelector } from "@/components/device-selector"
import { useTelemetry, useDeviceIds, useDeviceStatus } from "@/hooks/use-telemetry"
import { useDemoMode } from "@/contexts/demo-mode"
import { TimeRange, DeviceInfo } from "@/lib/types"
import { Thermometer, Droplets, Gauge, Battery, Clock, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const { deviceIds: realDeviceIds } = useDeviceIds()
  const { readings: realReadings, latestReading: realLatestReading, isLoading } = useTelemetry(selectedDevice, timeRange)
  const { isLive: realIsLive, lastSeen: realLastSeen } = useDeviceStatus(selectedDevice || null)
  const { isDemoMode, demoReadings, demoDeviceIds } = useDemoMode()

  // Use demo data when in demo mode
  const deviceIds = isDemoMode ? demoDeviceIds : realDeviceIds
  const readings = isDemoMode ? demoReadings : realReadings
  const latestReading = isDemoMode ? demoReadings[demoReadings.length - 1] : realLatestReading

  // Auto-select first device
  useEffect(() => {
    if (deviceIds.length > 0 && !selectedDevice) {
      setSelectedDevice(deviceIds[0])
    }
  }, [deviceIds, selectedDevice])

  // Determine if device is live (sent data in last 5 minutes)
  const isDeviceLive = isDemoMode ? true : realIsLive
  const lastSeen = isDemoMode ? new Date().toISOString() : realLastSeen

  const devices: DeviceInfo[] = deviceIds.map((id) => ({
    id,
    name: id,
    isOnline: id === selectedDevice ? isDeviceLive : false,
    lastSeen: id === selectedDevice ? lastSeen : null,
  }))

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
      <Header isLive={isDeviceLive} />
      <main className="container py-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col gap-6 pb-2 border-b border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  Tersano Remote Telemetry Unit
                  <span className="text-tersano-teal ml-2">(RTU)</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring and control for IoT devices
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeviceSelector
                  devices={devices}
                  value={selectedDevice}
                  onChange={setSelectedDevice}
                />
                <TimeRangeSelect value={timeRange} onChange={setTimeRange} />
              </div>
            </div>
          </div>

          {/* Primary Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Temperature"
              value={latestReading?.temperature_c?.toFixed(1) ?? "--"}
              unit="°C"
              icon={Thermometer}
              neonColor="cyan"
              isLive={isDeviceLive}
              trend={avgTemp && latestReading?.temperature_c ? (latestReading.temperature_c > avgTemp ? "up" : "down") : undefined}
              trendValue={avgTemp ? `Avg: ${avgTemp.toFixed(1)}°C` : undefined}
            />
            <StatCard
              title="Humidity"
              value={latestReading?.humidity_pct?.toFixed(1) ?? "--"}
              unit="%"
              icon={Droplets}
              neonColor="purple"
              isLive={isDeviceLive}
              trend={avgHumidity && latestReading?.humidity_pct ? (latestReading.humidity_pct > avgHumidity ? "up" : "down") : undefined}
              trendValue={avgHumidity ? `Avg: ${avgHumidity.toFixed(1)}%` : undefined}
            />
            <StatCard
              title="Pressure"
              value={latestReading?.pressure_hpa?.toFixed(0) ?? "--"}
              unit="hPa"
              icon={Gauge}
              neonColor="orange"
              isLive={isDeviceLive}
            />
            <StatCard
              title="Battery"
              value={latestReading?.battery_v?.toFixed(2) ?? "--"}
              unit="V"
              icon={Battery}
              neonColor="green"
              isLive={isDeviceLive}
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
              isLive={isDeviceLive}
            />
            <StatCard
              title="Total Readings"
              value={readings.length}
              icon={Activity}
              neonColor="cyan"
              isLive={isDeviceLive}
              trendValue={`In last ${timeRange}`}
              trend="neutral"
            />
            <StatCard
              title="Last Update"
              value={latestReading ? formatDistanceToNow(new Date(latestReading.created_at), { addSuffix: true }) : "--"}
              icon={Activity}
              neonColor="green"
              isLive={isDeviceLive}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TelemetryChart
              data={readings}
              dataKey="temperature_c"
              title="Temperature"
              description="Temperature readings over time"
              color="var(--neon-cyan)"
              unit="°C"
              isLive={isDeviceLive}
            />
            <TelemetryChart
              data={readings}
              dataKey="humidity_pct"
              title="Humidity"
              description="Humidity readings over time"
              color="var(--neon-purple)"
              unit="%"
              isLive={isDeviceLive}
            />
            <TelemetryChart
              data={readings}
              dataKey="pressure_hpa"
              title="Pressure"
              description="Atmospheric pressure readings"
              color="var(--neon-orange)"
              unit=" hPa"
              isLive={isDeviceLive}
            />
            <TelemetryChart
              data={readings}
              dataKey="battery_v"
              title="Battery Voltage"
              description="Battery level over time"
              color="var(--neon-green)"
              unit="V"
              isLive={isDeviceLive}
            />
          </div>

          {/* Readings Table */}
          <ReadingsTable
            readings={[...readings].reverse().slice(0, 20)}
            title="Recent Readings"
            description={`Latest telemetry data from ${selectedDevice || "device"}`}
            isLive={isDeviceLive}
          />
        </div>
      </main>
    </div>
  )
}
