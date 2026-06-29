'use client'

import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'

interface Props {
  title: string
  bengali: string
  eyebrow: string
  tagline: string
}

export default function ComingSoon({ title, bengali, eyebrow, tagline }: Props) {
  const { user, displayName, openAuthModal, signOut } = useAuth()
  const userInitial = (displayName || user?.email || '?')[0].toUpperCase()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = () => headerRef.current?.classList.toggle('stuck', window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (!userMenuOpen) return
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenuOpen])

  return (
    <>
      <div className="bg bg-night" />
      <div className="grain" />

      <header ref={headerRef}>
        <div className="shell bar">
          <Link className="brand" href="/">
            <span className="en">Kalponeek</span>
            <span className="div" />
            <span className="bn">কাল্পনিক</span>
          </Link>
          <Link className="back" href="/">← All stories</Link>
          <div className="hdr-right">
            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="user-avatar"
                  onClick={() => setUserMenuOpen(u => !u)}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  {userInitial}
                </button>
                {userMenuOpen && (
                  <div className="user-menu">
                    <Link href="/submissions/status" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                      My submissions
                    </Link>
                    <button
                      className="user-menu-item danger"
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="pill signin" onClick={openAuthModal}>Sign in</button>
            )}
          </div>
        </div>
      </header>

      <main className="cs-main">
        <div className="shell cs-shell">
          <div className="cs-content">
            <p className="eyebrow cs-eyebrow">{eyebrow}</p>
            <h1 className="cs-title">{title}</h1>
            <p className="cs-bengali">{bengali}</p>
            <p className="cs-tagline">{tagline}</p>
            <div className="cs-rule" />
            <p className="cs-note">
              This section is being built. In the meantime,{' '}
              <Link href="/" className="cs-link">browse the homepage</Link>
              {' '}or{' '}
              <Link href="/submit" className="cs-link">submit a piece</Link>.
            </p>
          </div>
        </div>
      </main>

      <footer className="slim">
        <div className="shell foot">
          <div className="f-en">Kalponeek</div>
          <small>A magazine of the imagined and the true</small>
        </div>
      </footer>
    </>
  )
}
