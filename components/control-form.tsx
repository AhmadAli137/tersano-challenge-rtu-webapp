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
import { Send, Timer, Volume2, Lightbulb, Play } from "lucide-react"
import { CommandPayload } from "@/lib/types"

interface ControlFormProps {
  deviceId: string
  onSendCommand: (command: CommandPayload) => Promise<void>
  isLoading?: boolean
}

// Preset colors for the color palette
const colorPresets = [
  { name: "Red", color: "#EF4444", rgb: { r: 239, g: 68, b: 68 } },
  { name: "Orange", color: "#F97316", rgb: { r: 249, g: 115, b: 22 } },
  { name: "Amber", color: "#F59E0B", rgb: { r: 245, g: 158, b: 11 } },
  { name: "Yellow", color: "#EAB308", rgb: { r: 234, g: 179, b: 8 } },
  { name: "Lime", color: "#84CC16", rgb: { r: 132, g: 204, b: 22 } },
  { name: "Green", color: "#22C55E", rgb: { r: 34, g: 197, b: 94 } },
  { name: "Teal", color: "#14B8A6", rgb: { r: 20, g: 184, b: 166 } },
  { name: "Cyan", color: "#06B6D4", rgb: { r: 6, g: 182, b: 212 } },
  { name: "Blue", color: "#3B82F6", rgb: { r: 59, g: 130, b: 246 } },
  { name: "Indigo", color: "#6366F1", rgb: { r: 99, g: 102, b: 241 } },
  { name: "Purple", color: "#A855F7", rgb: { r: 168, g: 85, b: 247 } },
  { name: "Pink", color: "#EC4899", rgb: { r: 236, g: 72, b: 153 } },
  { name: "White", color: "#FFFFFF", rgb: { r: 255, g: 255, b: 255 } },
  { name: "Off", color: "#1a1a1a", rgb: { r: 0, g: 0, b: 0 } },
]

// Buzzer tone presets
const buzzerTones = [
  { name: "Low", frequency: 440, duration: 200 },
  { name: "Medium", frequency: 880, duration: 200 },
  { name: "High", frequency: 1760, duration: 200 },
  { name: "Alert", frequency: 2000, duration: 500 },
  { name: "Warning", frequency: 1000, duration: 1000 },
  { name: "Success", frequency: 1500, duration: 300 },
]

// Sampling rate options
const samplingRates = [
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "5 minutes", value: 300000 },
  { label: "10 minutes", value: 600000 },
  { label: "30 minutes", value: 1800000 },
  { label: "1 hour", value: 3600000 },
]

export function ControlForm({ deviceId, onSendCommand, isLoading }: ControlFormProps) {
  const [selectedColor, setSelectedColor] = useState(colorPresets[7])
  const [samplingRate, setSamplingRate] = useState(samplingRates[0].value)

  const handleColorSelect = async (color: typeof colorPresets[0]) => {
    setSelectedColor(color)
    await onSendCommand({
      type: "set_rgb_led",
      r: color.rgb.r,
      g: color.rgb.g,
      b: color.rgb.b,
    })
  }

  const handleBuzzerPlay = async (tone: typeof buzzerTones[0]) => {
    await onSendCommand({
      type: "play_buzzer",
      frequency: tone.frequency,
      duration: tone.duration,
    })
  }

  const handleSamplingSubmit = async () => {
    await onSendCommand({
      type: "set_sampling_interval",
      sampling_interval_ms: samplingRate,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sampling Rate */}
      <Card className="border-neon-orange/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/5 to-transparent pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl p-2.5 bg-neon-orange/20">
              <Timer className="h-5 w-5 text-neon-orange" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Sampling Rate</h3>
              <p className="text-xs text-muted-foreground">Telemetry frequency</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={samplingRate.toString()} onValueChange={(v) => setSamplingRate(Number(v))}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {samplingRates.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSamplingSubmit}
              disabled={isLoading}
              size="icon"
              className="bg-neon-orange hover:bg-neon-orange/90 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RGB LED Control */}
      <Card className="border-tersano-teal/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tersano-teal/5 to-transparent pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="rounded-xl p-2.5 transition-colors duration-200"
              style={{ 
                backgroundColor: `${selectedColor.color}30`,
                boxShadow: `0 0 12px ${selectedColor.color}20`
              }}
            >
              <Lightbulb className="h-5 w-5" style={{ color: selectedColor.color === "#1a1a1a" ? "#888" : selectedColor.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">RGB LED</h3>
              <p className="text-xs text-muted-foreground">{selectedColor.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {colorPresets.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color)}
                disabled={isLoading}
                className={cn(
                  "aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                  selectedColor.name === color.name 
                    ? "border-white ring-2 ring-white/30" 
                    : "border-transparent hover:border-white/50"
                )}
                style={{ 
                  backgroundColor: color.color,
                  boxShadow: selectedColor.name === color.name ? `0 0 10px ${color.color}` : undefined
                }}
                title={color.name}
              />
            ))}
          </div>
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
