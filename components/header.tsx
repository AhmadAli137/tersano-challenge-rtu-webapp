"use client"

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

  return (
    <>
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
      (isDemoMode || isLive) ? "border-tersano-teal/40" : "border-border/50"
    )}>
      <div className="container px-4 flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 overflow-hidden rounded-full shadow-sm">
              <Image
                src="/tersano-logo.png"
                alt="Tersano"
                fill
                className="object-cover"
              />
            </div>
            <span className={cn(
              "hidden sm:inline text-base font-semibold tracking-tight",
              (isDemoMode || isLive) ? "text-tersano-teal" : "text-foreground"
            )}>Tersano RTU</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-tersano-teal/10 text-tersano-teal"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Device Selector with Live Status */}
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger 
              className={cn(
                "w-[140px] md:w-[200px] h-9 md:h-10 rounded-full border transition-all text-xs md:text-sm",
                isDemoMode 
                  ? "border-neon-purple/50 bg-neon-purple/5" 
                  : isLive 
                    ? "border-tersano-teal/50 bg-tersano-teal/5" 
                    : "border-border"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Live indicator */}
                <span className="relative flex h-2 w-2">
                  {(isDemoMode || isLive) ? (
                    <>
                      <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        isDemoMode ? "bg-neon-purple" : "bg-tersano-teal"
                      )}></span>
                      <span className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        isDemoMode ? "bg-neon-purple" : "bg-tersano-teal"
                      )}></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50"></span>
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
              "h-8 md:h-9 gap-1.5 md:gap-2 text-xs font-medium rounded-lg px-2 md:px-3",
              isDemoMode 
                ? "text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/15" 
                : "hover:bg-muted/50"
            )}
          >
            <FlaskConical className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{isDemoMode ? "Exit Demo" : "Demo"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    {/* Mobile Bottom Navigation */}
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
      (isDemoMode || isLive) ? "border-tersano-teal/40" : "border-border/50"
    )}>
      <div className="flex items-center justify-around h-16 px-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium rounded-lg transition-all min-w-[64px]",
                isActive
                  ? "text-tersano-teal"
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
    </>
  )
}
