import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A simple Pomodoro Timer to help you stay productive.',
  generator: 'eligosleyak',
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
        <link rel="icon" href="/pomodoro-icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <div style={logoContainerStyles}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="150"
            height="150"
            viewBox="0 0 100 100"
            style={logoStyles}
          >
            <circle cx="50" cy="50" r="45" fill="#ff3e00" />
            <circle cx="50" cy="50" r="40" fill="white" />
            <text x="50%" y="50%" fontSize="20" textAnchor="middle" dy=".3em" fill="#ff3e00">
              Pomodoro
            </text>
            <circle cx="50" cy="50" r="5" fill="#ff3e00" />
          </svg>
        </div>
        {children}
      </body>
    </html>
  )
}

const logoContainerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '20px',
}

const logoStyles = {
  borderRadius: '50%',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}
