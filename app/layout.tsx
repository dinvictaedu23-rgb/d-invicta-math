import React from 'react'

export const metadata = {
  title: 'D-INVICTA Math',
  description: 'Mathematics Learning & Assessment System',
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
