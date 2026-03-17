"use client"

import useSWR from "swr"
import { DeviceStatus, TimeRange } from "@/lib/types"
import { getDeviceEvents, getAllEvents } from "@/lib/actions"

export function useEvents(deviceId?: string, timeRange: TimeRange = "24h") {
  const fetcher = () => deviceId 
    ? getDeviceEvents(deviceId, timeRange, 500) 
    : getAllEvents(timeRange, 500)
  
  const { data, error, isLoading, mutate } = useSWR(
    ["events", deviceId, timeRange],
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  return {
    events: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
