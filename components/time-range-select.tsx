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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="font-medium">History</span>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-lg border bg-card shadow-sm">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-md",
              value === option.value
                ? "bg-tersano-teal text-white hover:bg-tersano-teal/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
