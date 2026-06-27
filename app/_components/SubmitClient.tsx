'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { submitPiece } from '../_actions/submissions'

const GENRES = ['Fiction', 'Poetry', 'Essay', 'Translation', 'Interview', 'Culture']
const RATINGS = ['All readers', '15+', '18+']

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export default function SubmitClient() {
  const headerRef = useRef<HTMLElement>(null)

  const [step, setStep] = useState<'form' | 'done'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [refNumber, setRefNumber] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [storyTitle, setStoryTitle] = useState('')
  const [genre, setGenre] = useState('Fiction')
  const [rating, setRating] = useState('All readers')
  const [coverLetter, setCoverLetter] = useState('')
  const [piece, setPiece] = useState('')
  const [prevPublished, setPrevPublished] = useState(false)

  const bioWc = wordCount(bio)
  const clWc = wordCount(coverLetter)

  // Sticky header
  useEffect(() => {
    const hdr = headerRef.current
    if (!hdr) return
    const handler = () => hdr.classList.toggle('stuck', window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Scroll-reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        }),
      { threshold: 0.08 },
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [step])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (bioWc > 100) return setError('Bio must be 100 words or fewer.')
    if (clWc > 300) return setError('Cover letter must be 300 words or fewer.')
    setError('')
    setSubmitting(true)
    try {
      const ref = await submitPiece({
        fullName, email, bio, storyTitle, genre,
        contentRating: rating, coverLetter, piece, prevPublished,
      })
      setRefNumber(ref)
      setStep('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const encodedSubject = encodeURIComponent(`Kalponeek submission received — ${refNumber}`)
  const encodedBody = encodeURIComponent(
    `Hi ${fullName},\n\nYour submission "${storyTitle}" has been received by Kalponeek.\n\nReference number: ${refNumber}\n\nKeep this number safe — you'll need it to check your submission status.\n\nCheck status: https://kalponeek.onrender.com/submissions/status\n\n— Kalponeek`
  )
  const mailtoHref = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`

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
          <span className="back">Open Submissions</span>
          <div className="hdr-right">
            <Link href="/submissions/status" className="pill">Check status</Link>
          </div>
        </div>
      </header>

      <main className="sub-page">
        {step === 'form' ? (
          <div className="shell">
            <div className="sub-intro load-in d1">
              <p className="eyebrow">Open Submissions · Issue 02</p>
              <h1 className="sub-heading">Submit a Piece</h1>
              <p className="sub-tagline">
                We read every submission with care. Fiction, poetry, essays, translations — all welcome.
                Response within eight weeks.
              </p>
            </div>

            <form className="sub-form" onSubmit={handleSubmit} noValidate>
              {/* ── About you ── */}
              <div className="form-section reveal">
                <h2 className="form-section-title">About you</h2>

                <div className="field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    id="fullName" type="text" className="fi" required
                    placeholder="Your name as you'd like it to appear"
                    value={fullName} onChange={e => setFullName(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email" type="email" className="fi" required
                    placeholder="We'll send your confirmation here"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="bio">
                    Short bio <span className="lim">· 100 words max</span>
                  </label>
                  <textarea
                    id="bio" className="fi ta" required rows={4}
                    placeholder="A brief bio in the third person — who you are, where you've been published, what you write."
                    value={bio} onChange={e => setBio(e.target.value)}
                  />
                  <div className={`wc${bioWc > 100 ? ' over' : ''}`}>{bioWc} / 100 words</div>
                </div>
              </div>

              <hr className="form-rule" />

              {/* ── Your piece ── */}
              <div className="form-section reveal">
                <h2 className="form-section-title">Your piece</h2>

                <div className="field">
                  <label htmlFor="storyTitle">Title</label>
                  <input
                    id="storyTitle" type="text" className="fi" required
                    placeholder="Working title is fine"
                    value={storyTitle} onChange={e => setStoryTitle(e.target.value)}
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="genre">Genre</label>
                    <select id="genre" className="fi" value={genre} onChange={e => setGenre(e.target.value)}>
                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <div className="field-label">Content rating</div>
                    <div className="rating-seg">
                      {RATINGS.map(r => (
                        <label key={r} className={`rating-opt${rating === r ? ' active' : ''}`}>
                          <input
                            type="radio" name="rating" value={r}
                            checked={rating === r} onChange={() => setRating(r)}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="field">
                  <div className="toggle-field">
                    <div>
                      <span className="toggle-label">Previously published?</span>
                      <span className="toggle-hint">Online, in print, or in another journal</span>
                    </div>
                    <button
                      type="button"
                      className={`sw${prevPublished ? ' on' : ''}`}
                      onClick={() => setPrevPublished(p => !p)}
                      aria-pressed={prevPublished}
                      aria-label="Toggle previously published"
                    />
                  </div>
                </div>
              </div>

              <hr className="form-rule" />

              {/* ── The work ── */}
              <div className="form-section reveal">
                <h2 className="form-section-title">The work</h2>

                <div className="field">
                  <label htmlFor="coverLetter">
                    Cover letter <span className="lim">· optional · 300 words max</span>
                  </label>
                  <textarea
                    id="coverLetter" className="fi ta" rows={5}
                    placeholder="Tell us about the piece — its context, its obsessions, why it matters to you. Not required, but always read."
                    value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  />
                  <div className={`wc${clWc > 300 ? ' over' : ''}`}>{clWc} / 300 words</div>
                </div>

                <div className="field">
                  <label htmlFor="piece">The piece</label>
                  <textarea
                    id="piece" className="fi ta large" required rows={22}
                    placeholder="Paste your work here. Poems, stories, essays — plain text is fine. Formatting will be handled by our editors."
                    value={piece} onChange={e => setPiece(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="sub-footer reveal">
                <button type="submit" className="btn sub-btn" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit piece →'}
                </button>
                <p className="sub-note">
                  By submitting you confirm this is your original work and grant Kalponeek
                  first-publication rights for the current issue.
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="shell">
            <div className="confirm-screen load-in d1">
              <div className="confirm-icon">
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="eyebrow">Received</p>
              <h2>Your piece is with us.</h2>
              <p className="confirm-sub">
                Thank you, {fullName}. We read every submission carefully and will
                respond within eight weeks.
              </p>

              <div className="ref-card">
                <div className="ref-label">Submission reference</div>
                <div className="ref-num">{refNumber}</div>
                <div className="ref-hint">
                  Save this number — you&apos;ll need it to check your submission status
                </div>
              </div>

              <div className="confirm-actions">
                <a href={mailtoHref} className="btn">Email yourself a copy</a>
                <Link href="/submissions/status" className="pill">Check status</Link>
                <Link href="/" className="pill">Back to Kalponeek</Link>
              </div>
            </div>
          </div>
        )}
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
