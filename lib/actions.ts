"use server"

import { createClient } from "@/lib/supabase/server"
import { TelemetryRow, DeviceStatus, CommandPayload, TimeRange } from "@/lib/types"
import { subMinutes, subHours } from "date-fns"

function getTimeRangeDate(range: TimeRange): Date {
  const now = new Date()
  switch (range) {
    case "15m":
      return subMinutes(now, 15)
    case "1h":
      return subHours(now, 1)
    case "6h":
      return subHours(now, 6)
    case "24h":
      return subHours(now, 24)
  }
}

export async function getTelemetryReadings(
  deviceId: string,
  timeRange: TimeRange = "1h",
  limit: number = 5000
): Promise<TelemetryRow[]> {
  const supabase = await createClient()
  const since = getTimeRangeDate(timeRange)

  const { data, error } = await supabase
    .from("telemetry")
    .select("*")
    .eq("device_id", deviceId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching telemetry:", error)
    return []
  }

  return data as TelemetryRow[]
}

export async function getLatestTelemetry(deviceId: string): Promise<TelemetryRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("telemetry")
    .select("*")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // No rows
    console.error("Error fetching latest telemetry:", error)
    return null
  }

  return data as TelemetryRow
}

export async function getDeviceEvents(
  deviceId: string,
  limit: number = 50
): Promise<DeviceStatus[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("status")
    .select("*")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching device events:", error)
    return []
  }

  return data as DeviceStatus[]
}

export async function getAllEvents(limit: number = 100): Promise<DeviceStatus[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("status")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching all events:", error)
    return []
  }

  return data as DeviceStatus[]
}

export async function sendDeviceCommand(
  deviceId: string,
  command: CommandPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from("device_commands").insert({
    device_id: deviceId,
    command: command,
    processed: false,
  })

  if (error) {
    console.error("Error sending command:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getDeviceIds(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("telemetry")
    .select("device_id")
    .order("created_at", { ascending: false })
    .limit(1000)

  if (error) {
    console.error("Error fetching device IDs:", error)
    return []
  }

  return [...new Set(data.map((row) => row.device_id))]
}

// Check if a device is "live" based on recent status events (heartbeat)
// A device is considered live if it has sent a status event within the threshold (default 60 seconds)
export async function isDeviceLive(
  deviceId: string,
  thresholdSeconds: number = 60
): Promise<boolean> {
  const supabase = await createClient()
  const threshold = new Date(Date.now() - thresholdSeconds * 1000)

  const { data, error } = await supabase
    .from("status")
    .select("created_at")
    .eq("device_id", deviceId)
    .gte("created_at", threshold.toISOString())
    .limit(1)

  if (error) {
    console.error("Error checking device liveness:", error)
    return false
  }

  return data.length > 0
}

// Get device status including liveness
// A device is considered "live" if it has sent a status event within the last 60 seconds
export async function getDeviceStatus(deviceId: string): Promise<{
  isLive: boolean
  lastSeen: string | null
  latestTelemetry: TelemetryRow | null
}> {
  const supabase = await createClient()

  // Check last status event for liveness (heartbeat)
  const { data: statusData } = await supabase
    .from("status")
    .select("created_at")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get latest telemetry for display
  const { data: telemetryData } = await supabase
    .from("telemetry")
    .select("*")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const lastSeenDate = statusData ? new Date(statusData.created_at) : null
  // 60 seconds threshold for heartbeat
  const liveThreshold = new Date(Date.now() - 60 * 1000)
  const isLive = lastSeenDate ? lastSeenDate > liveThreshold : false

  return {
    isLive,
    lastSeen: statusData?.created_at ?? null,
    latestTelemetry: telemetryData as TelemetryRow | null,
  }
}

export async function getPendingCommands(deviceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("commands")
    .select("*")
    .eq("device_id", deviceId)
    .eq("processed", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending commands:", error)
    return []
  }

  return data
}
