import type { Metadata } from 'next'
import { Source_Sans_3, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { DemoModeProvider } from '@/contexts/demo-mode'
import { DeviceProvider } from '@/contexts/device-context'
import { ControlProvider } from '@/contexts/control-context'
import './globals.css'

const sourceSans = Source_Sans_3({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"]
});
const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: 'Tersano Remote Telemetry Unit (RTU)',
  description: 'Real-time IoT telemetry monitoring and control panel for Tersano Remote Telemetry Units',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DemoModeProvider>
            <DeviceProvider>
              <ControlProvider>
                {children}
              </ControlProvider>
            </DeviceProvider>
          </DemoModeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
