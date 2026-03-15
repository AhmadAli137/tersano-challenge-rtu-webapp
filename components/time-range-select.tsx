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
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">History:</span>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-medium transition-all",
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
