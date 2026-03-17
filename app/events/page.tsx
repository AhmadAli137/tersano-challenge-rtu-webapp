"use client"

import { HeaderWrapper } from "@/components/header-wrapper"
import { EventsList } from "@/components/events-list"
import { CommandsList } from "@/components/commands-list"
import { useEvents } from "@/hooks/use-events"
import { useCommands } from "@/hooks/use-commands"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Heart, Terminal, CheckCircle2, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

export default function EventsPage() {
  const { selectedDevice } = useDevice()
  const { events: realEvents, isLoading: eventsLoading, refresh: refreshEvents } = useEvents(selectedDevice || undefined)
  const { commands: realCommands, isLoading: commandsLoading, refresh: refreshCommands } = useCommands(selectedDevice || undefined)
  const { isDemoMode, demoEvents } = useDemoMode()
  const [activeTab, setActiveTab] = useState("heartbeats")
  
  const events = isDemoMode ? demoEvents : realEvents
  const commands = isDemoMode ? [] : realCommands

  const isLoading = eventsLoading || commandsLoading
  
  const refresh = () => {
    refreshEvents()
    refreshCommands()
  }

  // Compute stats
  const stats = useMemo(() => {
    const heartbeats = events.filter(e => e.event.toLowerCase().includes("heartbeat")).length
    const otherEvents = events.length - heartbeats
    const processedCommands = commands.filter(c => c.processed).length
    const pendingCommands = commands.length - processedCommands
    
    return { 
      heartbeats, 
      otherEvents, 
      totalEvents: events.length,
      processedCommands, 
      pendingCommands, 
      totalCommands: commands.length 
    }
  }, [events, commands])

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="container px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Activity</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Device heartbeats and command history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 self-start sm:self-auto"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
              <TabsTrigger value="heartbeats" className="gap-2 data-[state=active]:bg-tersano-teal data-[state=active]:text-white">
                <Heart className="h-4 w-4" />
                <span>Heartbeats</span>
                <span className="ml-1 text-xs bg-background/20 px-1.5 py-0.5 rounded-full">
                  {stats.totalEvents}
                </span>
              </TabsTrigger>
              <TabsTrigger value="commands" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
                <Terminal className="h-4 w-4" />
                <span>Commands</span>
                <span className="ml-1 text-xs bg-background/20 px-1.5 py-0.5 rounded-full">
                  {stats.totalCommands}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heartbeats" className="mt-0">
              {/* Heartbeat Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="shadow-sm border-tersano-teal/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-tersano-teal/10">
                      <Heart className="h-5 w-5 text-tersano-teal" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-tersano-teal">{stats.heartbeats}</p>
                      <p className="text-xs text-muted-foreground">Heartbeats</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-neon-purple/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-purple/10">
                      <CheckCircle2 className="h-5 w-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neon-purple">{stats.otherEvents}</p>
                      <p className="text-xs text-muted-foreground">Other Events</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <EventsList events={events} maxHeight="calc(100vh - 400px)" />
            </TabsContent>

            <TabsContent value="commands" className="mt-0">
              {/* Command Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Card className="shadow-sm border-neon-green/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-green/10">
                      <CheckCircle2 className="h-5 w-5 text-neon-green" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neon-green">{stats.processedCommands}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-neon-orange/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-orange/10">
                      <Loader2 className="h-5 w-5 text-neon-orange" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-neon-orange">{stats.pendingCommands}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <CommandsList commands={commands} maxHeight="calc(100vh - 400px)" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
