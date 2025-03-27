import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',  // Changed title
  description: 'A simple Pomodoro Timer to help you stay productive.',
  generator: 'v0.dev',
  icons: {
    icon: '/pomodoro-icon.svg',  // Path to the SVG icon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/pomodoro-icon.svg" type="image/svg+xml" />  {/* Added favicon */}
      </head>
      <body>{children}</body>
    </html>
  )
}
