"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, Gauge, Terminal, FlaskConical } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDemoMode } from "@/contexts/demo-mode"
import { useDevice } from "@/contexts/device-context"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Control", href: "/control", icon: Terminal },
  { name: "Events", href: "/events", icon: Activity },
]

export function Header() {
  const pathname = usePathname()
  const { isDemoMode, toggleDemoMode } = useDemoMode()
  const { selectedDevice, setSelectedDevice, devices, isLive } = useDevice()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md" suppressHydrationWarning>
      <div className="container px-4 flex h-16 items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg shadow-sm border">
              <Image
                src="/tersano-logo.png"
                alt="Tersano"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-foreground">Tersano</span>
              <span className="text-sm font-medium text-tersano-teal ml-1">RTU</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                    isActive
                      ? "bg-background text-tersano-teal shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Device Selector with Live Status */}
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className={cn(
              "w-[150px] md:w-[200px] h-9 rounded-lg text-xs md:text-sm font-mono border shadow-sm",
              (isDemoMode || isLive) && "border-tersano-teal/40"
            )}>
              <div className="flex items-center gap-2">
                {/* Live indicator */}
                <span className="relative flex h-2.5 w-2.5">
                  {(isDemoMode || isLive) ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tersano-teal opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tersano-teal"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground/30"></span>
                  )}
                </span>
                <SelectValue placeholder="Select device" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {devices
                .filter((device) => device.id && device.id.trim() !== "")
                .map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name || device.id}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            variant={isDemoMode ? "default" : "outline"}
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              "h-9 gap-2 text-xs font-medium px-3 rounded-lg",
              isDemoMode && "bg-neon-purple hover:bg-neon-purple/90 text-white"
            )}
          >
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">{isDemoMode ? "Exit Demo" : "Demo"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    {/* Mobile Bottom Navigation - only render on client to avoid hydration issues */}
    {mounted && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/90 backdrop-blur-md">
        <div className="flex items-center justify-around h-16 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-all rounded-lg",
                  isActive
                    ? "text-tersano-teal bg-tersano-teal/10"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-tersano-teal")} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    )}
    </>
  )
}
