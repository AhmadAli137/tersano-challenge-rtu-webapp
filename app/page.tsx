"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { TelemetryChart } from "@/components/telemetry-chart"
import { ReadingsTable } from "@/components/readings-table"
import { TimeRangeSelect } from "@/components/time-range-select"
import { DeviceSelector } from "@/components/device-selector"
import { useTelemetry, useDeviceIds } from "@/hooks/use-telemetry"
import { TimeRange, DeviceInfo } from "@/lib/types"
import { Thermometer, Droplets, Gauge, Battery, Clock, Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1h")
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const { deviceIds } = useDeviceIds()
  const { readings, latestReading, isLoading } = useTelemetry(selectedDevice, timeRange)

  // Auto-select first device
  useEffect(() => {
    if (deviceIds.length > 0 && !selectedDevice) {
      setSelectedDevice(deviceIds[0])
    }
  }, [deviceIds, selectedDevice])

  const devices: DeviceInfo[] = deviceIds.map((id) => ({
    id,
    name: id,
    isOnline: latestReading?.device_id === id,
    lastSeen: latestReading?.created_at ?? null,
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time telemetry monitoring for your IoT devices
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

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Temperature"
              value={latestReading?.temperature_c?.toFixed(1) ?? "--"}
              unit="°C"
              icon={Thermometer}
              trend={avgTemp && latestReading?.temperature_c ? (latestReading.temperature_c > avgTemp ? "up" : "down") : undefined}
              trendValue={avgTemp ? `Avg: ${avgTemp.toFixed(1)}°C` : undefined}
            />
            <StatCard
              title="Humidity"
              value={latestReading?.humidity_pct?.toFixed(1) ?? "--"}
              unit="%"
              icon={Droplets}
              trend={avgHumidity && latestReading?.humidity_pct ? (latestReading.humidity_pct > avgHumidity ? "up" : "down") : undefined}
              trendValue={avgHumidity ? `Avg: ${avgHumidity.toFixed(1)}%` : undefined}
            />
            <StatCard
              title="Pressure"
              value={latestReading?.pressure_hpa?.toFixed(0) ?? "--"}
              unit="hPa"
              icon={Gauge}
            />
            <StatCard
              title="Battery"
              value={latestReading?.battery_v?.toFixed(2) ?? "--"}
              unit="V"
              icon={Battery}
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
            />
            <StatCard
              title="Total Readings"
              value={readings.length}
              icon={Activity}
              trendValue={`In last ${timeRange}`}
              trend="neutral"
            />
            <StatCard
              title="Last Update"
              value={latestReading ? formatDistanceToNow(new Date(latestReading.created_at), { addSuffix: true }) : "--"}
              icon={Activity}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TelemetryChart
              data={readings}
              dataKey="temperature_c"
              title="Temperature"
              description="Temperature readings over time"
              color="hsl(var(--chart-1))"
              unit="°C"
            />
            <TelemetryChart
              data={readings}
              dataKey="humidity_pct"
              title="Humidity"
              description="Humidity readings over time"
              color="hsl(var(--chart-2))"
              unit="%"
            />
            <TelemetryChart
              data={readings}
              dataKey="pressure_hpa"
              title="Pressure"
              description="Atmospheric pressure readings"
              color="hsl(var(--chart-3))"
              unit=" hPa"
            />
            <TelemetryChart
              data={readings}
              dataKey="battery_v"
              title="Battery Voltage"
              description="Battery level over time"
              color="hsl(var(--chart-4))"
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
