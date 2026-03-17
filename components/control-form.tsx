"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Timer, Volume2, Lightbulb, Play } from "lucide-react"
import { CommandPayload } from "@/lib/types"
import { useControl } from "@/contexts/control-context"

interface ControlFormProps {
  deviceId: string
  onSendCommand: (command: CommandPayload) => Promise<void>
  isLoading?: boolean
}

// Buzzer tone presets
const buzzerTones = [
  { name: "Low", frequency: 440, duration: 200 },
  { name: "Medium", frequency: 880, duration: 200 },
  { name: "High", frequency: 1760, duration: 200 },
  { name: "Alert", frequency: 2000, duration: 500 },
  { name: "Warning", frequency: 1000, duration: 1000 },
  { name: "Success", frequency: 1500, duration: 300 },
]

// Sampling rate options with RGB indicator colors
const samplingRates = [
  { label: "5 seconds", value: 5000, color: "#EC4899", colorName: "magenta", speed: "Fast" },
  { label: "5 minutes", value: 300000, color: "#22C55E", colorName: "green", speed: "Default" },
  { label: "30 minutes", value: 1800000, color: "#3B82F6", colorName: "blue", speed: "Slow" },
]

const getSamplingRateColor = (value: number) => {
  const rate = samplingRates.find(r => r.value === value)
  return rate || samplingRates[1]
}

export function ControlForm({ deviceId, onSendCommand, isLoading }: ControlFormProps) {
  const { samplingRate, setSamplingRate, isBlinking, setIsBlinking, isLoadingState } = useControl()
  
  const isDisabled = isLoading || isLoadingState

  const handleSamplingChange = async (value: string) => {
    const newRate = Number(value)
    setSamplingRate(newRate)
    await onSendCommand({
      type: "set_sampling_interval",
      sampling_interval_ms: newRate,
    })
  }

  const handleBlinkToggle = async () => {
    const newBlinkState = !isBlinking
    setIsBlinking(newBlinkState)
    await onSendCommand({
      type: "toggle_led_blink",
      enabled: newBlinkState,
    })
  }

  const handleBuzzerPlay = async (tone: typeof buzzerTones[0]) => {
    await onSendCommand({
      type: "play_buzzer",
      frequency: tone.frequency,
      duration: tone.duration,
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Sampling Rate */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-muted">
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">Sampling Rate</h3>
              <p className="text-xs text-muted-foreground">{getSamplingRateColor(samplingRate).speed}</p>
            </div>
            <div 
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getSamplingRateColor(samplingRate).color }}
            />
          </div>
          <Select value={samplingRate.toString()} onValueChange={handleSamplingChange} disabled={isDisabled}>
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {samplingRates.map((rate) => (
                <SelectItem key={rate.value} value={rate.value.toString()}>
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: rate.color }}
                    />
                    {rate.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* RGB LED Blink Control */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-md",
              isBlinking ? "bg-tersano-teal/10" : "bg-muted"
            )}>
              <Lightbulb className={cn(
                "h-4 w-4",
                isBlinking ? "text-tersano-teal" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h3 className="text-sm font-medium">RGB LED</h3>
              <p className="text-xs text-muted-foreground">{isBlinking ? "Blinking" : "Off"}</p>
            </div>
          </div>
          <Button
            onClick={handleBlinkToggle}
            disabled={isDisabled}
            variant={isBlinking ? "default" : "outline"}
            className={cn(
              "w-full h-9",
              isBlinking && "bg-tersano-teal hover:bg-tersano-teal/90"
            )}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            {isBlinking ? "Stop" : "Start Blink"}
          </Button>
        </CardContent>
      </Card>

      {/* Buzzer Control */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-muted">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Buzzer</h3>
              <p className="text-xs text-muted-foreground">Play a tone</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {buzzerTones.map((tone) => (
              <Button
                key={tone.name}
                variant="outline"
                size="sm"
                onClick={() => handleBuzzerPlay(tone)}
                disabled={isDisabled}
                className="h-8 text-xs"
              >
                {tone.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
