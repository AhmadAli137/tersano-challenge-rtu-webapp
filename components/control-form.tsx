"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Send, Timer, Volume2, Lightbulb, Play, Square } from "lucide-react"
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
  { name: "Low Beep", frequency: 440, duration: 200 },
  { name: "Medium Beep", frequency: 880, duration: 200 },
  { name: "High Beep", frequency: 1760, duration: 200 },
  { name: "Alert", frequency: 2000, duration: 500 },
  { name: "Warning", frequency: 1000, duration: 1000 },
  { name: "Success", frequency: 1500, duration: 300 },
  { name: "Error", frequency: 300, duration: 800 },
  { name: "Notification", frequency: 1200, duration: 150 },
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
  const [selectedColor, setSelectedColor] = useState(colorPresets[7]) // Default to Cyan
  const [customR, setCustomR] = useState(6)
  const [customG, setCustomG] = useState(182)
  const [customB, setCustomB] = useState(212)
  const [selectedTone, setSelectedTone] = useState(buzzerTones[0])
  const [samplingRate, setSamplingRate] = useState(samplingRates[0].value)

  const handleColorSelect = (color: typeof colorPresets[0]) => {
    setSelectedColor(color)
    setCustomR(color.rgb.r)
    setCustomG(color.rgb.g)
    setCustomB(color.rgb.b)
  }

  const handleColorSubmit = async () => {
    await onSendCommand({
      type: "set_rgb_led",
      r: customR,
      g: customG,
      b: customB,
    })
  }

  const handleBuzzerPlay = async (tone: typeof buzzerTones[0]) => {
    setSelectedTone(tone)
    await onSendCommand({
      type: "play_buzzer",
      frequency: tone.frequency,
      duration: tone.duration,
    })
  }

  const handleBuzzerStop = async () => {
    await onSendCommand({
      type: "stop_buzzer",
    })
  }

  const handleSamplingSubmit = async () => {
    await onSendCommand({
      type: "set_sampling_interval",
      sampling_interval_ms: samplingRate,
    })
  }

  const currentColor = `rgb(${customR}, ${customG}, ${customB})`

  return (
    <div className="space-y-4">
      {/* RGB LED Control */}
      <Card className="border-tersano-teal/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tersano-teal/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-tersano-teal/20">
              <Lightbulb className="h-4 w-4 text-tersano-teal" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">RGB LED Control</CardTitle>
              <CardDescription className="text-xs">Select a color for the device LED</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {/* Color preview */}
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-xl border-2 border-border/50 shadow-lg transition-colors duration-200"
              style={{ backgroundColor: currentColor, boxShadow: `0 0 20px ${currentColor}40` }}
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{selectedColor.name}</p>
              <p className="text-xs font-mono text-muted-foreground">
                RGB({customR}, {customG}, {customB})
              </p>
            </div>
          </div>

          {/* Color palette */}
          <div className="grid grid-cols-7 gap-2">
            {colorPresets.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorSelect(color)}
                className={cn(
                  "h-8 w-full rounded-lg border-2 transition-all duration-200 hover:scale-110",
                  selectedColor.name === color.name 
                    ? "border-white shadow-lg ring-2 ring-offset-2 ring-offset-background" 
                    : "border-transparent hover:border-white/50"
                )}
                style={{ 
                  backgroundColor: color.color,
                  boxShadow: selectedColor.name === color.name ? `0 0 12px ${color.color}` : undefined
                }}
                title={color.name}
              />
            ))}
          </div>

          {/* RGB Sliders */}
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-red-500 font-medium">Red</Label>
                <span className="text-xs font-mono text-muted-foreground">{customR}</span>
              </div>
              <Slider
                value={[customR]}
                onValueChange={([value]) => setCustomR(value)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-red-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-green-500 font-medium">Green</Label>
                <span className="text-xs font-mono text-muted-foreground">{customG}</span>
              </div>
              <Slider
                value={[customG]}
                onValueChange={([value]) => setCustomG(value)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-green-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-blue-500 font-medium">Blue</Label>
                <span className="text-xs font-mono text-muted-foreground">{customB}</span>
              </div>
              <Slider
                value={[customB]}
                onValueChange={([value]) => setCustomB(value)}
                min={0}
                max={255}
                step={1}
                className="[&_[role=slider]]:bg-blue-500"
              />
            </div>
          </div>

          <Button
            onClick={handleColorSubmit}
            disabled={isLoading}
            className="w-full bg-tersano-teal hover:bg-tersano-teal/90 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Set LED Color
          </Button>
        </CardContent>
      </Card>

      {/* Buzzer Control */}
      <Card className="border-neon-purple/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-neon-purple/20">
              <Volume2 className="h-4 w-4 text-neon-purple" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Buzzer Control</CardTitle>
              <CardDescription className="text-xs">Play different tones on the device</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {/* Tone buttons */}
          <div className="grid grid-cols-2 gap-2">
            {buzzerTones.map((tone) => (
              <Button
                key={tone.name}
                variant="outline"
                size="sm"
                onClick={() => handleBuzzerPlay(tone)}
                disabled={isLoading}
                className={cn(
                  "justify-start gap-2 h-10 transition-all",
                  selectedTone.name === tone.name && "border-neon-purple/50 bg-neon-purple/10 text-neon-purple"
                )}
              >
                <Play className="h-3 w-3" />
                <span className="text-xs">{tone.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{tone.frequency}Hz</span>
              </Button>
            ))}
          </div>

          <Button
            variant="destructive"
            onClick={handleBuzzerStop}
            disabled={isLoading}
            className="w-full"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Buzzer
          </Button>
        </CardContent>
      </Card>

      {/* Sampling Rate */}
      <Card className="border-neon-orange/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-neon-orange/20">
              <Timer className="h-4 w-4 text-neon-orange" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Sampling Rate</CardTitle>
              <CardDescription className="text-xs">Configure telemetry frequency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="space-y-2">
            <Label className="text-xs">Select Interval</Label>
            <Select value={samplingRate.toString()} onValueChange={(v) => setSamplingRate(Number(v))}>
              <SelectTrigger className="w-full">
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
          </div>

          <Button
            onClick={handleSamplingSubmit}
            disabled={isLoading}
            className="w-full bg-neon-orange hover:bg-neon-orange/90 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Set Sampling Rate
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
