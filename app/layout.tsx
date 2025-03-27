import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A simple Pomodoro Timer to help you stay productive.',
  generator: 'eligosleyak',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill=\'%23ff3e00\'/><circle cx="50" cy="50" r="40" fill=\'white\'/><text x="50%" y="55%" font-size="20" text-anchor="middle" dy=".3em" fill=\'%23ff3e00\'>🍅</text></svg>',
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
        {/* Favicon using embedded SVG */}
        <link 
          rel="icon" 
          type="image/svg+xml" 
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ff3e00'/><circle cx='50' cy='50' r='40' fill='white'/><text x='50%' y='55%' font-size='20' text-anchor='middle' dy='.3em' fill='%23ff3e00'>🍅</text></svg>" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
