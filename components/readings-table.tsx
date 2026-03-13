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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCircle2, XCircle } from "lucide-react"

interface ReadingsTableProps {
  readings: TelemetryRow[]
  title?: string
  description?: string
}

export function ReadingsTable({ readings, title = "Recent Readings", description }: ReadingsTableProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] text-xs">Time</TableHead>
                <TableHead className="text-xs">Seq</TableHead>
                <TableHead className="text-xs">Temp</TableHead>
                <TableHead className="text-xs">Humidity</TableHead>
                <TableHead className="text-xs">Pressure</TableHead>
                <TableHead className="text-xs">Battery</TableHead>
                <TableHead className="text-xs">Status</TableHead>
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
                        <span className="font-medium font-mono text-tersano-teal">
                          {reading.temperature_c.toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.humidity_pct !== null ? (
                        <span className="font-medium font-mono text-neon-purple">
                          {reading.humidity_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reading.pressure_hpa !== null ? (
                        <span className="font-medium font-mono text-neon-orange">
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
                            reading.battery_v > 3.3 && "bg-neon-green/20 text-neon-green border-neon-green/30"
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
                        <CheckCircle2 className="h-4 w-4 text-neon-green" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neon-pink" />
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
