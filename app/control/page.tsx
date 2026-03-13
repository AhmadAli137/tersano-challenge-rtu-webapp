"use client"

import { useState } from "react"
import { HeaderWrapper } from "@/components/header-wrapper"
import { ControlForm } from "@/components/control-form"
import { Card, CardContent } from "@/components/ui/card"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { sendDeviceCommand } from "@/lib/actions"
import { CommandPayload } from "@/lib/types"
import { Terminal } from "lucide-react"

export default function ControlPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { selectedDevice } = useDevice()
  const { isDemoMode } = useDemoMode()

  const handleSendCommand = async (command: CommandPayload) => {
    if (!selectedDevice) return
    setIsLoading(true)
    
    if (isDemoMode) {
      // Simulate command in demo mode
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
      return
    }
    
    try {
      const result = await sendDeviceCommand(selectedDevice, command)
      if (!result.success) {
        alert(`Failed to send command: ${result.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/50">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-tersano-teal via-neon-purple to-neon-orange bg-clip-text text-transparent">
                  Control Panel
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure device settings and send commands
              </p>
            </div>
          </div>

          {/* Main Content */}
          {selectedDevice ? (
            <ControlForm
              deviceId={selectedDevice}
              onSendCommand={handleSendCommand}
              isLoading={isLoading}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <Terminal className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No device selected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a device from the dropdown above to send commands
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
