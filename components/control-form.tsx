"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useDemoMode } from "@/contexts/demo-mode"
import { cn } from "@/lib/utils"
import { Send, Timer, Volume2, Code } from "lucide-react"
import { CommandPayload } from "@/lib/types"

interface ControlFormProps {
  deviceId: string
  onSendCommand: (command: CommandPayload) => Promise<void>
  isLoading?: boolean
}

export function ControlForm({ deviceId, onSendCommand, isLoading }: ControlFormProps) {
  const { isDemoMode } = useDemoMode()
  const [samplingInterval, setSamplingInterval] = useState(5000)
  const [buzzerOn, setBuzzerOn] = useState(false)
  const [buzzerFrequency, setBuzzerFrequency] = useState(1000)
  const [customCommand, setCustomCommand] = useState("")

  const handleSamplingSubmit = async () => {
    await onSendCommand({
      type: "set_sampling_interval",
      sampling_interval_ms: samplingInterval,
    })
  }

  const handleBuzzerSubmit = async () => {
    await onSendCommand({
      type: "set_buzzer",
      buzzer_on: buzzerOn,
      buzzer_frequency: buzzerFrequency,
    })
  }

  const handleCustomSubmit = async () => {
    if (!customCommand.trim()) return
    try {
      const parsed = JSON.parse(customCommand)
      await onSendCommand({
        type: "custom",
        ...parsed,
      })
      setCustomCommand("")
    } catch {
      alert("Invalid JSON format")
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Timer className={cn("h-3.5 w-3.5", isDemoMode ? "text-neon-cyan" : "text-muted-foreground")} />
            <CardTitle className="text-sm font-medium">Sampling Interval</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Configure telemetry frequency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Interval</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {(samplingInterval / 1000).toFixed(1)}s
              </span>
            </div>
            <Slider
              value={[samplingInterval]}
              onValueChange={([value]) => setSamplingInterval(value)}
              min={1000}
              max={60000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1s</span>
              <span>60s</span>
            </div>
          </div>
          <Button
            onClick={handleSamplingSubmit}
            disabled={isLoading}
            size="sm"
            className={cn("w-full", isDemoMode && "bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className={cn("h-3.5 w-3.5", isDemoMode ? "text-neon-purple" : "text-muted-foreground")} />
            <CardTitle className="text-sm font-medium">Buzzer Control</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Control device alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="buzzer-switch">Enable Buzzer</Label>
            <Switch
              id="buzzer-switch"
              checked={buzzerOn}
              onCheckedChange={setBuzzerOn}
            />
          </div>
          {buzzerOn && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Frequency</Label>
                <span className="text-sm font-mono text-muted-foreground">
                  {buzzerFrequency} Hz
                </span>
              </div>
              <Slider
                value={[buzzerFrequency]}
                onValueChange={([value]) => setBuzzerFrequency(value)}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
            </div>
          )}
          <Button
            onClick={handleBuzzerSubmit}
            disabled={isLoading}
            size="sm"
            className={cn("w-full", isDemoMode && "bg-neon-purple/15 text-neon-purple hover:bg-neon-purple/25")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code className={cn("h-3.5 w-3.5", isDemoMode ? "text-neon-orange" : "text-muted-foreground")} />
            <CardTitle className="text-sm font-medium">Custom Command</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Send custom JSON to {deviceId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-command">JSON Payload</Label>
            <Input
              id="custom-command"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder='{"action": "calibrate", "params": {}}'
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleCustomSubmit}
            disabled={isLoading || !customCommand.trim()}
            variant="secondary"
            size="sm"
            className={cn("w-full", isDemoMode && "bg-neon-orange/15 text-neon-orange hover:bg-neon-orange/25")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
