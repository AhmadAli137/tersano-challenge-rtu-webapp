"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useDevice } from "./device-context"
import { getDeviceControlState } from "@/lib/actions"

interface ControlContextType {
  samplingRate: number
  setSamplingRate: (rate: number) => void
  isBlinking: boolean
  setIsBlinking: (blinking: boolean) => void
  isLoadingState: boolean
}

const ControlContext = createContext<ControlContextType | undefined>(undefined)

// Default sampling rate: 5 minutes (300000ms)
const DEFAULT_SAMPLING_RATE = 300000

export function ControlProvider({ children }: { children: ReactNode }) {
  const { selectedDevice } = useDevice()
  const [samplingRate, setSamplingRate] = useState<number>(DEFAULT_SAMPLING_RATE)
  const [isBlinking, setIsBlinking] = useState<boolean>(false)
  const [isLoadingState, setIsLoadingState] = useState<boolean>(false)
  
  // Store per-device state locally to avoid refetching on every tab switch
  const [deviceStates, setDeviceStates] = useState<Record<string, { samplingRate: number; isBlinking: boolean }>>({})

  // Fetch control state from Supabase when device changes
  useEffect(() => {
    async function fetchControlState() {
      if (!selectedDevice) return
      
      // Check if we already have cached state for this device
      if (deviceStates[selectedDevice]) {
        setSamplingRate(deviceStates[selectedDevice].samplingRate)
        setIsBlinking(deviceStates[selectedDevice].isBlinking)
        return
      }

      setIsLoadingState(true)
      try {
        const state = await getDeviceControlState(selectedDevice)
        const newSamplingRate = state.samplingRate ?? DEFAULT_SAMPLING_RATE
        const newIsBlinking = state.isBlinking ?? false
        
        setSamplingRate(newSamplingRate)
        setIsBlinking(newIsBlinking)
        
        // Cache the state
        setDeviceStates(prev => ({
          ...prev,
          [selectedDevice]: { samplingRate: newSamplingRate, isBlinking: newIsBlinking }
        }))
      } catch (error) {
        console.error("Error fetching device control state:", error)
        // Reset to defaults on error
        setSamplingRate(DEFAULT_SAMPLING_RATE)
        setIsBlinking(false)
      } finally {
        setIsLoadingState(false)
      }
    }

    fetchControlState()
  }, [selectedDevice, deviceStates])

  // Update cached state when user changes values
  const handleSetSamplingRate = (rate: number) => {
    setSamplingRate(rate)
    if (selectedDevice) {
      setDeviceStates(prev => ({
        ...prev,
        [selectedDevice]: { ...prev[selectedDevice], samplingRate: rate, isBlinking: prev[selectedDevice]?.isBlinking ?? false }
      }))
    }
  }

  const handleSetIsBlinking = (blinking: boolean) => {
    setIsBlinking(blinking)
    if (selectedDevice) {
      setDeviceStates(prev => ({
        ...prev,
        [selectedDevice]: { samplingRate: prev[selectedDevice]?.samplingRate ?? DEFAULT_SAMPLING_RATE, isBlinking: blinking }
      }))
    }
  }

  return (
    <ControlContext.Provider
      value={{
        samplingRate,
        setSamplingRate: handleSetSamplingRate,
        isBlinking,
        setIsBlinking: handleSetIsBlinking,
        isLoadingState,
      }}
    >
      {children}
    </ControlContext.Provider>
  )
}

export function useControl() {
  const context = useContext(ControlContext)
  if (context === undefined) {
    throw new Error("useControl must be used within a ControlProvider")
  }
  return context
}
