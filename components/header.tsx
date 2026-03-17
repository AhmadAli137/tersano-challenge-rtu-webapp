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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container px-4 flex h-14 items-center justify-between" suppressHydrationWarning>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
              <Image
                src="/tersano-logo.png"
                alt="Tersano"
                fill
                className="object-cover"
              />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-foreground">Tersano RTU</span>
          </Link>
          <nav className="hidden md:flex items-center">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Selector with Live Status */}
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="w-[140px] md:w-[180px] h-8 rounded-md border-border text-xs md:text-sm font-mono">
              <div className="flex items-center gap-2">
                {/* Live indicator */}
                <span className="relative flex h-2 w-2">
                  {(isDemoMode || isLive) ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/40"></span>
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
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              "h-8 gap-1.5 text-xs font-medium px-2.5",
              isDemoMode && "text-neon-purple"
            )}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isDemoMode ? "Exit" : "Demo"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    {/* Mobile Bottom Navigation - only render on client to avoid hydration issues */}
    {mounted && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-14 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
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
