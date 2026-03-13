"use client"

import useSWR from "swr"
import { DeviceStatus } from "@/lib/types"
import { getDeviceEvents, getAllEvents } from "@/lib/actions"

export function useEvents(deviceId?: string) {
  const fetcher = () => deviceId ? getDeviceEvents(deviceId, 100) : getAllEvents(100)
  
  const { data, error, isLoading, mutate } = useSWR(
    ["events", deviceId],
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
