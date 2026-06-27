'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { checkSubmissionStatus, type StatusResult } from '../_actions/submissions'

const STATUS_META: Record<string, { label: string; badgeClass: string; message: string }> = {
  pending: {
    label: 'In queue',
    badgeClass: 'badge-pending',
    message:
      'Your submission is in our reading queue. We work through every piece carefully — you can expect a response within eight weeks of your submission date.',
  },
  'under review': {
    label: 'Under review',
    badgeClass: 'badge-review',
    message:
      "Your piece has caught our editors' attention and is currently being considered for publication. We'll be in touch soon.",
  },
  accepted: {
    label: 'Accepted',
    badgeClass: 'badge-accepted',
    message:
      "Congratulations — we'd like to publish your work. Our editors will reach out to your email address to discuss next steps.",
  },
  rejected: {
    label: 'Not selected',
    badgeClass: 'badge-rejected',
    message:
      "We've read your piece with care, but it's not the right fit for this issue. We hope you'll consider submitting again — we welcome resubmissions and new work.",
  },
}

export default function StatusClient() {
  const headerRef = useRef<HTMLElement>(null)

  const [email, setEmail] = useState('')
  const [ref, setRef] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<StatusResult | null | 'not-found'>(null)

  useEffect(() => {
    const hdr = headerRef.current
    if (!hdr) return
    const handler = () => hdr.classList.toggle('stuck', window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setChecking(true)
    setResult(null)
    try {
      const data = await checkSubmissionStatus(email, ref)
      setResult(data ?? 'not-found')
    } catch {
      setResult('not-found')
    } finally {
      setChecking(false)
    }
  }

  const meta =
    result && result !== 'not-found'
      ? (STATUS_META[result.status] ?? STATUS_META['pending'])
      : null

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

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
          <span className="back">Submission Status</span>
          <div className="hdr-right">
            <Link href="/submit" className="pill">Submit a piece</Link>
          </div>
        </div>
      </header>

      <main className="sub-page">
        <div className="shell">
          <div className="sub-intro load-in d1">
            <p className="eyebrow">Writers Portal</p>
            <h1 className="sub-heading">Check Your Status</h1>
            <p className="sub-tagline">
              Enter the email you submitted with and your reference number to see where
              your piece stands.
            </p>
          </div>

          <div className="status-wrap">
            <div className="status-lookup load-in d2">
              <h2>Find your submission</h2>
              <form onSubmit={handleCheck} noValidate>
                <div className="field">
                  <label htmlFor="s-email">Email address</label>
                  <input
                    id="s-email" type="email" className="fi" required
                    placeholder="The email you used when submitting"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="s-ref">Reference number</label>
                  <input
                    id="s-ref" type="text" className="fi" required
                    placeholder="e.g. KLP-AB3C7D"
                    value={ref}
                    onChange={e => setRef(e.target.value.toUpperCase())}
                    style={{ fontFamily: '"Fraunces", serif', letterSpacing: '.05em' }}
                  />
                </div>
                <button type="submit" className="btn status-check-btn" disabled={checking}>
                  {checking ? 'Checking…' : 'Check status →'}
                </button>
              </form>
            </div>

            {result === 'not-found' && (
              <div className="status-result load-in d1">
                <p className="status-not-found">
                  No submission found matching that email and reference number. Please
                  double-check both and try again.
                </p>
              </div>
            )}

            {result && result !== 'not-found' && meta && (
              <div className="status-result load-in d1">
                <div className="s-title">{result.storyTitle}</div>
                <div className="s-meta">
                  {result.genre} · Submitted {formatDate(result.submittedAt)}
                </div>
                <span className={`status-badge ${meta.badgeClass}`}>
                  <svg width="8" height="8" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
                    <circle cx="4" cy="4" r="4" fill="currentColor" />
                  </svg>
                  {meta.label}
                </span>
                <p className="status-msg">{meta.message}</p>
              </div>
            )}

            <div className="sub-footer" style={{ marginTop: '3rem' }}>
              <Link href="/submit" className="pill">Submit another piece</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="slim">
        <div className="shell foot">
          <div>
            <span className="f-en">Kalponeek</span>
            <span className="f-bn">কাল্পনিক</span>
            <small>© 2026 Kalponeek · All rights reserved</small>
          </div>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/submit">Submit</Link>
            <Link href="/submissions/status">Check Status</Link>
          </nav>
        </div>
      </footer>
    </>
  )
}
