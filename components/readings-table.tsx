"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TelemetryRow } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCircle2, XCircle, Clock, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ReadingsTableProps {
  readings: TelemetryRow[]
  title?: string
  description?: string
  showLegend?: boolean
  pageSize?: number
}

export function ReadingsTable({ readings, title = "Recent Readings", description, showLegend = true, pageSize = 10 }: ReadingsTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const hasCachedData = readings.some(r => r.was_cached === true)
  
  const totalPages = Math.ceil(readings.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const paginatedReadings = readings.slice(startIndex, endIndex)
  
  return (
    <Card className="border-border">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {showLegend && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] bg-neon-green/10 text-neon-green border-neon-green/30 py-0">
                  Live
                </Badge>
                <span className="text-muted-foreground">Real-time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] bg-cached/10 text-cached border-cached/30 py-0 gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  Cached
                </Badge>
                <span className="text-muted-foreground">From backlog</span>
              </div>
            </div>
          )}
        </div>
        {hasCachedData && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-cached/5 border border-cached/20">
            <Info className="h-4 w-4 text-cached flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-cached">Cached data detected.</span>{" "}
              Some readings were captured while the device was offline and published when connectivity was restored. 
              These rows show the original capture time but were received later during backlog sync.
            </p>
          </div>
        )}
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
                <TableHead className="text-xs">Sensor</TableHead>
                <TableHead className="text-xs">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReadings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No readings available
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReadings.map((reading) => {
                  const isCached = reading.was_cached === true
                  return (
                  <TableRow 
                    key={reading.id}
                    className={cn(isCached && "bg-cached/5")}
                  >
                    <TableCell className="font-mono text-xs">
                      <span className={cn(isCached && "text-cached")}>
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
                              <Badge variant="outline" className="text-[10px] bg-cached/10 text-cached border-cached/30 gap-1">
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
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between py-3 px-4 border-t">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, readings.length)} of {readings.length} readings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="h-7 px-2"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
