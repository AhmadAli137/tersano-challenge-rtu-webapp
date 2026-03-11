"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { DeviceStatus } from "@/lib/types"
import { useEffect } from "react"

async function fetchEvents(deviceId?: string): Promise<DeviceStatus[]> {
  const supabase = createClient()

  let query = supabase
    .from("device_status")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (deviceId) {
    query = query.eq("device_id", deviceId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as DeviceStatus[]
}

export function useEvents(deviceId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    ["events", deviceId],
    () => fetchEvents(deviceId),
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  // Set up realtime subscription
  useEffect(() => {
    const supabase = createClient()
    
    const channelConfig = deviceId
      ? {
          event: "INSERT" as const,
          schema: "public",
          table: "device_status",
          filter: `device_id=eq.${deviceId}`,
        }
      : {
          event: "INSERT" as const,
          schema: "public",
          table: "device_status",
        }

    const channel = supabase
      .channel(`events-${deviceId || "all"}`)
      .on("postgres_changes", channelConfig, (payload) => {
        mutate((current) => {
          if (!current) return [payload.new as DeviceStatus]
          return [payload.new as DeviceStatus, ...current]
        }, false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deviceId, mutate])

  return {
    events: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
