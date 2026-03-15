"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ControlContextType {
  samplingRate: number
  setSamplingRate: (rate: number) => void
  isBlinking: boolean
  setIsBlinking: (blinking: boolean) => void
}

const ControlContext = createContext<ControlContextType | undefined>(undefined)

// Default sampling rate: 5 minutes (300000ms)
const DEFAULT_SAMPLING_RATE = 300000

export function ControlProvider({ children }: { children: ReactNode }) {
  const [samplingRate, setSamplingRate] = useState<number>(DEFAULT_SAMPLING_RATE)
  const [isBlinking, setIsBlinking] = useState<boolean>(false)

  return (
    <ControlContext.Provider
      value={{
        samplingRate,
        setSamplingRate,
        isBlinking,
        setIsBlinking,
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
