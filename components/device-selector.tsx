"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeviceInfo } from "@/lib/types"
import { Radio } from "lucide-react"

interface DeviceSelectorProps {
  devices: DeviceInfo[]
  value: string
  onChange: (value: string) => void
}

export function DeviceSelector({ devices, value, onChange }: DeviceSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <SelectValue placeholder="Select device" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {devices.map((device) => (
          <SelectItem key={device.id} value={device.id}>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${device.isOnline ? "bg-green-500" : "bg-red-500"}`} />
              <span>{device.name || device.id}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
