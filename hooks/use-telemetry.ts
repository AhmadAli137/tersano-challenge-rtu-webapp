"use client"

import useSWR from "swr"
import { TelemetryRow, TimeRange } from "@/lib/types"
import { getTelemetryReadings, getDeviceIds, getDeviceStatus, getAllDevicesStatus } from "@/lib/actions"

export function useTelemetry(deviceId: string, timeRange: TimeRange) {
  const { data, error, isLoading, mutate } = useSWR(
    deviceId ? [`telemetry`, deviceId, timeRange] : null,
    () => getTelemetryReadings(deviceId, timeRange, 500),
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
    }
  )

  return {
    readings: data ?? [],
    latestReading: data?.[data.length - 1] ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useDeviceIds() {
  const { data, error, isLoading } = useSWR("device-ids", getDeviceIds, {
    refreshInterval: 30000,
  })

  return {
    deviceIds: data ?? [],
    isLoading,
    error,
  }
}

// Hook to check if a device is live (has sent data in last 60 seconds)
export function useDeviceStatus(deviceId: string | null) {
  const { data, error, isLoading } = useSWR(
    deviceId ? [`device-status`, deviceId] : null,
    () => getDeviceStatus(deviceId!),
    {
      refreshInterval: 5000, // Check every 5 seconds for responsive liveness
      revalidateOnFocus: true,
    }
  )

  return {
    isLive: data?.isLive ?? false,
    lastSeen: data?.lastSeen ?? null,
    latestTelemetry: data?.latestTelemetry ?? null,
    isLoading,
    error,
  }
}

// Hook to get liveness status for ALL devices
export function useAllDevicesStatus() {
  const { data, error, isLoading } = useSWR(
    "all-devices-status",
    getAllDevicesStatus,
    {
      refreshInterval: 5000, // Check every 5 seconds for responsive liveness
      revalidateOnFocus: true,
    }
  )

  return {
    devicesStatus: data ?? {},
    isLoading,
    error,
  }
}
