"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { TelemetryRow, TimeRange } from "@/lib/types"
import { subMinutes, subHours } from "date-fns"
import { useEffect } from "react"

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

async function fetchTelemetry(
  deviceId: string,
  timeRange: TimeRange
): Promise<TelemetryRow[]> {
  console.log("[v0] fetchTelemetry: Starting for device:", deviceId, "timeRange:", timeRange)
  const supabase = createClient()
  const since = getTimeRangeDate(timeRange)
  console.log("[v0] fetchTelemetry: Since date:", since.toISOString())

  const { data, error } = await supabase
    .from("telemetry")
    .select("*")
    .eq("device_id", deviceId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(500)

  console.log("[v0] fetchTelemetry: Result - data count:", data?.length, "error:", error)
  
  if (error) {
    console.error("[v0] fetchTelemetry: Error:", error)
    throw error
  }
  return data as TelemetryRow[]
}

export function useTelemetry(deviceId: string, timeRange: TimeRange) {
  const { data, error, isLoading, mutate } = useSWR(
    deviceId ? [`telemetry`, deviceId, timeRange] : null,
    () => fetchTelemetry(deviceId, timeRange),
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  )

  // Set up realtime subscription
  useEffect(() => {
    if (!deviceId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`telemetry-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "telemetry",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          mutate((current) => {
            if (!current) return [payload.new as TelemetryRow]
            return [...current, payload.new as TelemetryRow]
          }, false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deviceId, mutate])

  return {
    readings: data ?? [],
    latestReading: data?.[data.length - 1] ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useDeviceIds() {
  const fetcher = async () => {
    console.log("[v0] useDeviceIds: Starting fetch...")
    const supabase = createClient()
    console.log("[v0] useDeviceIds: Supabase client created")
    
    const { data, error } = await supabase
      .from("telemetry")
      .select("device_id")
      .order("created_at", { ascending: false })
      .limit(1000)

    console.log("[v0] useDeviceIds: Query result - data:", data, "error:", error)
    
    if (error) {
      console.error("[v0] useDeviceIds: Error fetching:", error)
      throw error
    }
    
    const uniqueIds = [...new Set(data.map((row) => row.device_id))]
    console.log("[v0] useDeviceIds: Unique IDs:", uniqueIds)
    return uniqueIds
  }

  const { data, error, isLoading } = useSWR("device-ids", fetcher, {
    refreshInterval: 30000,
    onError: (err) => console.error("[v0] useDeviceIds SWR error:", err),
  })

  console.log("[v0] useDeviceIds: SWR state - data:", data, "error:", error, "isLoading:", isLoading)

  return {
    deviceIds: data ?? [],
    isLoading,
    error,
  }
}
