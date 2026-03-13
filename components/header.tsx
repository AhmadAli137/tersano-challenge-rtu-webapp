"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Activity, Gauge, Terminal, FlaskConical } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { useDemoMode } from "@/contexts/demo-mode"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Control", href: "/control", icon: Terminal },
  { name: "Events", href: "/events", icon: Activity },
]

interface HeaderProps {
  isLive?: boolean
}

export function Header({ isLive = false }: HeaderProps) {
  const pathname = usePathname()
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80",
      (isDemoMode || isLive) ? "border-tersano-teal/40" : "border-border/50"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white p-1 shadow-sm ring-1 ring-border/50">
              <Image
                src="/tersano-logo.jpg"
                alt="Tersano"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={cn(
                "text-sm font-semibold tracking-tight leading-none",
                (isDemoMode || isLive) ? "text-tersano-teal" : "text-foreground"
              )}>Tersano RTU</span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">Remote Telemetry Unit</span>
            </div>
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
        <div className="flex items-center gap-2">
          <div className={cn(
            "hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
            isDemoMode 
              ? "text-neon-purple bg-neon-purple/10 border-neon-purple/30" 
              : isLive 
                ? "text-tersano-teal bg-tersano-teal/10 border-tersano-teal/30" 
                : "text-muted-foreground bg-muted/30 border-border"
          )}>
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
            <span>{isDemoMode ? "Demo Mode" : isLive ? "Live" : "Offline"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              "h-9 gap-2 text-xs font-medium rounded-lg",
              isDemoMode 
                ? "text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/15" 
                : "hover:bg-muted/50"
            )}
          >
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">{isDemoMode ? "Exit Demo" : "Demo"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
