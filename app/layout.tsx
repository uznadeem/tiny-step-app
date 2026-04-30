import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tinystep — The ADHD Planner Built for Women Like You',
  description: 'Stop staring at your to-do list in paralysis. Tinystep breaks any task into tiny, dopamine-friendly steps — calibrated to your energy right now.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
