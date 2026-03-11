"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TelemetryRow } from "@/lib/types"
import { useDemoMode } from "@/contexts/demo-mode"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCircle2, XCircle } from "lucide-react"

interface ReadingsTableProps {
  readings: TelemetryRow[]
  title?: string
  description?: string
}

export function ReadingsTable({ readings, title = "Recent Readings", description }: ReadingsTableProps) {
  const { isDemoMode } = useDemoMode()
  
  return (
    <Card className={cn(isDemoMode && "border-primary/30")}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Time</TableHead>
                <TableHead>Seq</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Humidity</TableHead>
                <TableHead>Pressure</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No readings available
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(reading.created_at), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{reading.seq}</TableCell>
                    <TableCell>
                      {reading.temperature_c !== null ? (
                        <span className={cn("font-medium font-mono", isDemoMode && "text-neon-cyan")}>
                          {reading.temperature_c.toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.humidity_pct !== null ? (
                        <span className={cn("font-medium font-mono", isDemoMode && "text-neon-purple")}>
                          {reading.humidity_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.pressure_hpa !== null ? (
                        <span className={cn("font-medium font-mono", isDemoMode && "text-neon-orange")}>
                          {reading.pressure_hpa.toFixed(0)} hPa
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.battery_v !== null ? (
                        <Badge 
                          variant={reading.battery_v > 3.3 ? "default" : "destructive"} 
                          className={cn(
                            "font-mono",
                            isDemoMode && reading.battery_v > 3.3 && "bg-neon-green/20 text-neon-green border-neon-green/30"
                          )}
                        >
                          {reading.battery_v.toFixed(2)}V
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.sensor_ok ? (
                        <CheckCircle2 className={cn("h-4 w-4", isDemoMode ? "text-neon-green" : "text-success")} />
                      ) : (
                        <XCircle className={cn("h-4 w-4", isDemoMode ? "text-neon-pink" : "text-destructive")} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
