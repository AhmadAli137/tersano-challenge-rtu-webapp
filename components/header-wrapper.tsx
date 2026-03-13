"use client"

import dynamic from "next/dynamic"

// Dynamically import Header with SSR disabled to avoid hydration mismatches
// caused by Radix UI generating different IDs on server vs client
const Header = dynamic(
  () => import("./header").then((mod) => ({ default: mod.Header })),
  { 
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container px-4 flex h-14 md:h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="hidden sm:block h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-[140px] md:w-[200px] bg-muted rounded-full animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
    )
  }
)

export function HeaderWrapper() {
  return <Header />
}
