import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { DemoModeProvider } from '@/contexts/demo-mode'
import { DeviceProvider } from '@/contexts/device-context'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DemoModeProvider>
            <DeviceProvider>
              {children}
            </DeviceProvider>
          </DemoModeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
