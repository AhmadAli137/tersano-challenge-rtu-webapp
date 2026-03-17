"use client"

import { Button } from "@/components/ui/button"
import { TimeRange } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimeRangeSelectProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

const options: { value: TimeRange; label: string }[] = [
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
]

export function TimeRangeSelect({ value, onChange }: TimeRangeSelectProps) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-muted/50">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs font-medium rounded-sm",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
