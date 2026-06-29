'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../_lib/supabase'

type Tab = 'signin' | 'signup' | 'magic'

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTab('signin')
      setEmail('')
      setPassword('')
      setDisplayName('')
      setError('')
      setSentEmail('')
      const timer = setTimeout(() => emailRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setSentEmail('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      } else if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || email.split('@')[0] },
          },
        })
        if (error) throw error
        if (!data.session) {
          setSentEmail(email)
        } else {
          onClose()
        }
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        })
        if (error) throw error
        setSentEmail(email)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="auth-scrim"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-logo">Kalponeek</div>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'signin'}
            className={`auth-tab${tab === 'signin' ? ' active' : ''}`}
            onClick={() => switchTab('signin')}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={tab === 'signup'}
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Create account
          </button>
          <button
            role="tab"
            aria-selected={tab === 'magic'}
            className={`auth-tab${tab === 'magic' ? ' active' : ''}`}
            onClick={() => switchTab('magic')}
          >
            Magic link
          </button>
        </div>

        {sentEmail ? (
          <div className="auth-sent">
            <div className="auth-sent-icon">✉</div>
            <p>
              Check your inbox — we sent a link to <b>{sentEmail}</b>.
              {tab === 'signup' && ' Click it to activate your account.'}
            </p>
            <button className="auth-link-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {tab === 'signup' && (
              <div className="field">
                <label htmlFor="auth-name">Display name</label>
                <input
                  id="auth-name"
                  type="text"
                  className="fi"
                  placeholder="Your name or pen name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                ref={emailRef}
                type="email"
                className="fi"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {tab !== 'magic' && (
              <div className="field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  className="fi"
                  required
                  placeholder={tab === 'signup' ? 'At least 8 characters' : '••••••••'}
                  minLength={tab === 'signup' ? 8 : undefined}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            )}

            {tab === 'magic' && (
              <p className="auth-magic-note">
                Enter your email and we'll send a one-click sign-in link — no password needed.
              </p>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn auth-submit-btn" disabled={loading}>
              {loading
                ? 'Working…'
                : tab === 'signin'
                  ? 'Sign in →'
                  : tab === 'signup'
                    ? 'Create account →'
                    : 'Send magic link →'}
            </button>

            {tab === 'signin' && (
              <p className="auth-footer-note">
                No account?{' '}
                <button type="button" className="auth-link-btn" onClick={() => switchTab('signup')}>
                  Create one
                </button>
                {' · '}
                <button type="button" className="auth-link-btn" onClick={() => switchTab('magic')}>
                  Forgot password
                </button>
              </p>
            )}
            {tab === 'signup' && (
              <p className="auth-footer-note">
                Already have an account?{' '}
                <button type="button" className="auth-link-btn" onClick={() => switchTab('signin')}>
                  Sign in
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
