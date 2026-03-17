"use client"

import useSWR from "swr"
import { getDeviceCommands, getAllCommands } from "@/lib/actions"

export function useCommands(deviceId?: string) {
  const fetcher = () => deviceId ? getDeviceCommands(deviceId, 100) : getAllCommands(100)
  
  const { data, error, isLoading, mutate } = useSWR(
    ["commands", deviceId],
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  return {
    commands: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
