"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Gauge, Terminal, Radio, FlaskConical } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { useDemoMode } from "@/contexts/demo-mode"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Control Panel", href: "/control", icon: Terminal },
  { name: "Device Events", href: "/events", icon: Activity },
]

interface HeaderProps {
  isLive?: boolean
}

export function Header({ isLive = false }: HeaderProps) {
  const pathname = usePathname()
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl",
      isDemoMode ? "border-neon-cyan/40" : "border-border/50"
    )}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-all",
              isDemoMode ? "bg-neon-cyan/15 ring-1 ring-neon-cyan/30" : "bg-foreground"
            )}>
              <Radio className={cn(
                "h-4 w-4",
                isDemoMode ? "text-neon-cyan" : "text-background"
              )} />
            </div>
            <span className={cn(
              "text-sm font-semibold tracking-tight",
              isDemoMode && "text-neon-cyan"
            )}>Tersano RTU</span>
          </Link>
          <nav className="hidden md:flex items-center">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              const neonColors = ["text-neon-cyan", "text-neon-purple", "text-neon-pink"]
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? isDemoMode 
                        ? neonColors[index]
                        : "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
            isDemoMode 
              ? "text-neon-green bg-neon-green/10" 
              : isLive 
                ? "text-success bg-success/10" 
                : "text-muted-foreground bg-muted/50"
          )}>
            <span className="relative flex h-1.5 w-1.5">
              {(isDemoMode || isLive) ? (
                <>
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isDemoMode ? "bg-neon-green" : "bg-success"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-1.5 w-1.5",
                    isDemoMode ? "bg-neon-green" : "bg-success"
                  )}></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-muted-foreground"></span>
              )}
            </span>
            <span>{isDemoMode ? "Demo" : isLive ? "Live" : "Offline"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              "h-8 gap-1.5 text-xs",
              isDemoMode && "text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/15"
            )}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isDemoMode ? "Exit Demo" : "Demo"}</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
