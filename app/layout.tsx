import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from './_components/AuthProvider'

export const metadata: Metadata = {
  title: { default: 'Kalponeek — কাল্পনিক', template: '%s — Kalponeek' },
  description: 'A magazine of fiction, essays, poetry, and everything in between.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600&family=Atkinson+Hyperlegible:wght@400;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Lexend:wght@400;500&family=Spectral:ital,wght@0,400;0,500;1,400&family=Tiro+Bangla:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
