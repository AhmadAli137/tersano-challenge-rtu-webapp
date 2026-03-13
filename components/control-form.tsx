"use client"

import { useState } from "react"
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
  const [samplingRate, setSamplingRate] = useState(samplingRates[1].value)
  const [isBlinking, setIsBlinking] = useState(false)

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
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sampling Rate */}
      <Card className="border-border/50 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none transition-colors duration-300" 
          style={{ backgroundColor: `${getSamplingRateColor(samplingRate).color}08` }}
        />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="rounded-xl p-2.5 transition-all duration-300"
              style={{ 
                backgroundColor: `${getSamplingRateColor(samplingRate).color}20`,
                boxShadow: `0 0 12px ${getSamplingRateColor(samplingRate).color}30`
              }}
            >
              <Timer className="h-5 w-5 transition-colors duration-300" style={{ color: getSamplingRateColor(samplingRate).color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Sampling Rate</h3>
              <p className="text-xs text-muted-foreground">{getSamplingRateColor(samplingRate).speed}</p>
            </div>
            {/* RGB Indicator */}
            <div 
              className="ml-auto h-3 w-3 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: getSamplingRateColor(samplingRate).color,
                boxShadow: `0 0 8px ${getSamplingRateColor(samplingRate).color}`
              }}
            />
          </div>
          <Select value={samplingRate.toString()} onValueChange={handleSamplingChange} disabled={isLoading}>
            <SelectTrigger className="w-full">
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
      <Card className="border-tersano-teal/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tersano-teal/5 to-transparent pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "rounded-xl p-2.5 transition-all duration-200",
              isBlinking ? "bg-tersano-teal/30 animate-pulse" : "bg-tersano-teal/20"
            )}>
              <Lightbulb className={cn(
                "h-5 w-5 transition-colors",
                isBlinking ? "text-tersano-teal" : "text-tersano-teal/70"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">RGB LED</h3>
              <p className="text-xs text-muted-foreground">{isBlinking ? "Blinking" : "Steady"}</p>
            </div>
          </div>
          <Button
            onClick={handleBlinkToggle}
            disabled={isLoading}
            variant={isBlinking ? "default" : "outline"}
            className={cn(
              "w-full transition-all",
              isBlinking 
                ? "bg-tersano-teal hover:bg-tersano-teal/90 text-white" 
                : "hover:border-tersano-teal/50 hover:bg-tersano-teal/10 hover:text-tersano-teal"
            )}
          >
            <Lightbulb className={cn("h-4 w-4 mr-2", isBlinking && "animate-pulse")} />
            {isBlinking ? "Stop Blinking" : "Start Blinking"}
          </Button>
        </CardContent>
      </Card>

      {/* Buzzer Control */}
      <Card className="border-neon-purple/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl p-2.5 bg-neon-purple/20">
              <Volume2 className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Buzzer Tones</h3>
              <p className="text-xs text-muted-foreground">Play a sound</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {buzzerTones.map((tone) => (
              <Button
                key={tone.name}
                variant="outline"
                size="sm"
                onClick={() => handleBuzzerPlay(tone)}
                disabled={isLoading}
                className="h-9 text-xs gap-1 hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-neon-purple"
              >
                <Play className="h-3 w-3" />
                {tone.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
