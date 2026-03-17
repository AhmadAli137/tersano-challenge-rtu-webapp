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
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReadingsTableProps {
  readings: TelemetryRow[]
  title?: string
  description?: string
}

export function ReadingsTable({ readings, title = "Recent Readings", description }: ReadingsTableProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 pt-4 px-4">
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
                <TableHead className="text-xs">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No readings available
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => {
                  const isCached = reading.was_cached === true
                  return (
                  <TableRow 
                    key={reading.id}
                    className={cn(isCached && "bg-neon-orange/5")}
                  >
                    <TableCell className="font-mono text-xs">
                      <span className={cn(isCached && "text-neon-orange")}>
                        {format(new Date(reading.created_at), "h:mm:ss a")}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{reading.seq}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {reading.temperature_c !== null ? (
                        `${reading.temperature_c.toFixed(1)}°C`
                      ) : "--"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {reading.humidity_pct !== null ? (
                        `${reading.humidity_pct.toFixed(1)}%`
                      ) : "--"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {reading.pressure_hpa !== null ? (
                        `${reading.pressure_hpa.toFixed(0)} hPa`
                      ) : "--"}
                    </TableCell>
                    <TableCell>
                      {reading.battery_v !== null ? (
                        <Badge 
                          variant={reading.battery_v > 3.3 ? "secondary" : "destructive"} 
                          className="font-mono text-xs"
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
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {isCached ? (
                              <Badge variant="outline" className="text-[10px] bg-neon-orange/10 text-neon-orange border-neon-orange/30 gap-1">
                                <Clock className="h-3 w-3" />
                                Cached
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-neon-green/10 text-neon-green border-neon-green/30">
                                Live
                              </Badge>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            {isCached ? (
                              <div className="space-y-1">
                                <p className="font-medium">Cached from backlog</p>
                                {reading.captured_uptime_ms !== null && (
                                  <p>Captured at: {(reading.captured_uptime_ms / 1000).toFixed(1)}s uptime</p>
                                )}
                                {reading.published_uptime_ms !== null && (
                                  <p>Published at: {(reading.published_uptime_ms / 1000).toFixed(1)}s uptime</p>
                                )}
                              </div>
                            ) : (
                              <p>Real-time data</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
