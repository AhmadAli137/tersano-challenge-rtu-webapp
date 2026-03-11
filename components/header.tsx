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

export function Header() {
  const pathname = usePathname()
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isDemoMode ? "border-neon-cyan border-glow-cyan" : "border-border"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
              isDemoMode ? "bg-neon-cyan glow-cyan" : "bg-primary"
            )}>
              <Radio className={cn(
                "h-5 w-5",
                isDemoMode ? "text-background" : "text-primary-foreground"
              )} />
            </div>
            <span className={cn(
              "text-lg font-semibold tracking-tight",
              isDemoMode && "text-neon-cyan text-glow-cyan"
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
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <Button
            variant={isDemoMode ? "default" : "outline"}
            size="sm"
            onClick={toggleDemoMode}
            className={cn(
              "gap-2 transition-all",
              isDemoMode && "bg-neon-purple text-background glow-purple hover:bg-neon-purple/90"
            )}
          >
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">{isDemoMode ? "Demo Active" : "Demo Mode"}</span>
          </Button>
          <div className={cn(
            "hidden sm:flex items-center gap-2 text-sm",
            isDemoMode ? "text-neon-green" : "text-muted-foreground"
          )}>
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isDemoMode ? "bg-neon-green" : "bg-green-400"
              )}></span>
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isDemoMode ? "bg-neon-green" : "bg-green-500"
              )}></span>
            </span>
            <span className={isDemoMode ? "text-glow-green" : ""}>{isDemoMode ? "Demo" : "Live"}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
