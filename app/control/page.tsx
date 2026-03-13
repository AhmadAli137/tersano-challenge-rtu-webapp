"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ControlForm } from "@/components/control-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { sendDeviceCommand } from "@/lib/actions"
import { CommandPayload, DeviceCommand } from "@/lib/types"
import { Terminal, CheckCircle2, Clock, Send } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"

export default function ControlPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [demoCommands, setDemoCommands] = useState<DeviceCommand[]>([])
  const { selectedDevice } = useDevice()
  const { isDemoMode } = useDemoMode()

  // Fetch recent commands
  const { data: recentCommands, mutate: refreshCommands } = useSWR(
    selectedDevice ? [`commands`, selectedDevice] : null,
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("device_commands")
        .select("*")
        .eq("device_id", selectedDevice)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      return data as DeviceCommand[]
    },
    { refreshInterval: 5000 }
  )

  const handleSendCommand = async (command: CommandPayload) => {
    if (!selectedDevice) return
    setIsLoading(true)
    
    if (isDemoMode) {
      // Simulate command in demo mode
      await new Promise(resolve => setTimeout(resolve, 500))
      const newCommand: DeviceCommand = {
        id: `demo-cmd-${Date.now()}`,
        device_id: selectedDevice,
        command: command,
        processed: false,
        created_at: new Date().toISOString(),
      }
      setDemoCommands(prev => [newCommand, ...prev])
      // Mark as processed after a delay
      setTimeout(() => {
        setDemoCommands(prev => 
          prev.map(cmd => cmd.id === newCommand.id ? { ...cmd, processed: true } : cmd)
        )
      }, 2000)
      setIsLoading(false)
      return
    }
    
    try {
      const result = await sendDeviceCommand(selectedDevice, command)
      if (result.success) {
        refreshCommands()
      } else {
        alert(`Failed to send command: ${result.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const displayCommands = isDemoMode ? demoCommands : recentCommands

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-2 border-b border-border/50">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Control Panel</h1>
              <p className="text-sm text-muted-foreground">
                Send commands and configure devices
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Control Form */}
            <div>
              {selectedDevice ? (
                <ControlForm
                  deviceId={selectedDevice}
                  onSendCommand={handleSendCommand}
                  isLoading={isLoading}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Select a device to send commands
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Command History */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 text-muted-foreground" />
                  Command History
                </CardTitle>
                <CardDescription className="text-xs">
                  Recent commands sent to {selectedDevice || "device"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!displayCommands || displayCommands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No commands sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayCommands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className={`rounded-full p-2 ${cmd.processed ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                          {cmd.processed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {cmd.command.type}
                            </Badge>
                            <Badge variant={cmd.processed ? "default" : "secondary"} className="text-xs">
                              {cmd.processed ? "Processed" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(cmd.created_at), "PPp")}
                          </p>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto font-mono">
                            {JSON.stringify(cmd.command, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
