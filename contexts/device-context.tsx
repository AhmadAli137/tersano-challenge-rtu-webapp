"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useDeviceIds, useDeviceStatus } from "@/hooks/use-telemetry"
import { useDemoMode } from "@/contexts/demo-mode"
import { DeviceInfo } from "@/lib/types"

interface DeviceContextType {
  selectedDevice: string
  setSelectedDevice: (device: string) => void
  deviceIds: string[]
  devices: DeviceInfo[]
  isLive: boolean
  lastSeen: string | null
  isLoading: boolean
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const { deviceIds: realDeviceIds, isLoading } = useDeviceIds()
  const { isLive: realIsLive, lastSeen: realLastSeen } = useDeviceStatus(selectedDevice || null)
  const { isDemoMode, demoDeviceIds } = useDemoMode()

  // Use demo data when in demo mode
  const deviceIds = isDemoMode ? demoDeviceIds : realDeviceIds
  const isLive = isDemoMode ? true : realIsLive
  const lastSeen = isDemoMode ? new Date().toISOString() : realLastSeen

  // Auto-select first device
  useEffect(() => {
    if (deviceIds.length > 0 && !selectedDevice) {
      setSelectedDevice(deviceIds[0])
    }
  }, [deviceIds, selectedDevice])

  // Reset selection if device no longer exists
  useEffect(() => {
    if (selectedDevice && deviceIds.length > 0 && !deviceIds.includes(selectedDevice)) {
      setSelectedDevice(deviceIds[0])
    }
  }, [deviceIds, selectedDevice])

  const devices: DeviceInfo[] = deviceIds.map((id) => ({
    id,
    name: id,
    isOnline: id === selectedDevice ? isLive : false,
    lastSeen: id === selectedDevice ? lastSeen : null,
  }))

  return (
    <DeviceContext.Provider
      value={{
        selectedDevice,
        setSelectedDevice,
        deviceIds,
        devices,
        isLive,
        lastSeen,
        isLoading,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevice() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider")
  }
  return context
}
