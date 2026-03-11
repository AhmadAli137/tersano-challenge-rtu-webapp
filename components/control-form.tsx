"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Send, Timer, Volume2 } from "lucide-react"
import { CommandPayload } from "@/lib/types"

interface ControlFormProps {
  deviceId: string
  onSendCommand: (command: CommandPayload) => Promise<void>
  isLoading?: boolean
}

export function ControlForm({ deviceId, onSendCommand, isLoading }: ControlFormProps) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Sampling Interval</CardTitle>
          </div>
          <CardDescription>
            Configure how often the device sends telemetry data
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
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Command
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Buzzer Control</CardTitle>
          </div>
          <CardDescription>
            Control the device buzzer for alerts
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
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Command
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Command</CardTitle>
          <CardDescription>
            Send a custom JSON command to device {deviceId}
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
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Custom Command
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
