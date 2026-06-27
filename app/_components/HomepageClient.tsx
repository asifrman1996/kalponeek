'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const STORIES = [
  'The Cartographers of Sleep',
  'Notes on a City That Forgets',
  'Saltwater Liturgy',
  'The Last Translator',
  'What the River Kept',
  'An Interview with the Dark',
  'Cassette Futures',
]

const CARDS = [
  { scene: 'scene-b', cat: 'Essay', rating: null, label: 'All readers', title: 'Notes on a City That Forgets', dek: 'Tahmid Karim walks the streets that keep being renamed.', slug: 'notes-on-a-city-that-forgets' },
  { scene: 'scene-c', cat: 'Poetry', rating: null, label: 'All readers', title: 'Saltwater Liturgy', dek: 'Three poems on tide, memory, and leaving.', slug: 'saltwater-liturgy' },
  { scene: 'scene-d', cat: 'Fiction', rating: '18+', label: null, title: 'The Last Translator', dek: 'A love story told in the margins of a banned book.', slug: 'the-last-translator', mature: true },
  { scene: 'scene-e', cat: 'Translation', rating: null, label: 'All readers', title: 'What the River Kept', dek: 'A folk tale carried from Bangla into English, intact and strange.', slug: 'what-the-river-kept' },
  { scene: 'scene-b', cat: 'Interview', rating: null, label: 'All readers', title: 'An Interview with the Dark', dek: 'The novelist J. Okafor on writing only between midnight and four.', slug: 'an-interview-with-the-dark' },
  { scene: 'scene-c', cat: 'Culture', rating: '15+', label: null, title: 'Cassette Futures', dek: 'Why a generation is recording its grief onto tape.', slug: 'cassette-futures' },
]

export default function HomepageClient() {
  const [isDay, setIsDay] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(true)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const [overlaySearch, setOverlaySearch] = useState('')

  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const bgNightRef = useRef<HTMLDivElement>(null)
  const bgDayRef = useRef<HTMLDivElement>(null)
  const catsBodyRef = useRef<HTMLDivElement>(null)
  const carouselTrackRef = useRef<HTMLDivElement>(null)
  const overlayInputRef = useRef<HTMLInputElement>(null)
  const inlineSearchRef = useRef<HTMLInputElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Apply day class to body
  useEffect(() => {
    document.body.classList.toggle('day', isDay)
  }, [isDay])

  // Scroll: header, progress, wordmark parallax, bg parallax, image parallax
  useEffect(() => {
    let ticking = false
    function onScroll() {
      const y = window.scrollY
      const wh = window.innerHeight
      const docH = document.documentElement.scrollHeight - wh

      headerRef.current?.classList.toggle('stuck', y > 40)

      if (progressRef.current) {
        progressRef.current.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%'
      }
      if (wordmarkRef.current) {
        wordmarkRef.current.style.transform = `translateY(${y * 0.30}px)`
        wordmarkRef.current.style.opacity = String(Math.max(0, 1 - y / 420))
      }
      const bgShift = y * 0.08
      if (bgNightRef.current) bgNightRef.current.style.transform = `translateY(${bgShift}px)`
      if (bgDayRef.current) bgDayRef.current.style.transform = `translateY(${bgShift}px)`

      document.querySelectorAll<HTMLElement>('[data-par]').forEach(f => {
        const r = f.parentElement!.getBoundingClientRect()
        if (r.bottom < -100 || r.top > wh + 100) return
        const prog = (r.top + r.height / 2 - wh / 2) / wh
        f.style.setProperty('--py', (prog * -22) + 'px')
      })
      ticking = false
    }
    const handler = () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true } }
    window.addEventListener('scroll', handler, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // IntersectionObserver for scroll reveals
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
      if (!el.style.getPropertyValue('--d')) {
        const sibs = [...el.parentElement!.children].filter(c => c.classList.contains('reveal'))
        const i = sibs.indexOf(el)
        if (i > 0) el.style.setProperty('--d', (i * 100) + 'ms')
      }
    })
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Init cats body height
  useEffect(() => {
    const timer = setTimeout(() => {
      if (catsBodyRef.current) {
        catsBodyRef.current.style.maxHeight = catsBodyRef.current.scrollHeight + 'px'
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Toggle cats body
  useEffect(() => {
    const el = catsBodyRef.current
    if (!el) return
    if (catsOpen) {
      el.style.maxHeight = el.scrollHeight + 'px'
      el.style.opacity = '1'
    } else {
      el.style.maxHeight = '0'
      el.style.opacity = '0'
    }
  }, [catsOpen])

  // Update carousel transform
  useEffect(() => {
    const track = carouselTrackRef.current
    if (!track) return
    const card = track.children[0] as HTMLElement | null
    if (!card) return
    const gap = parseInt(getComputedStyle(track).gap || '0')
    const cardW = card.offsetWidth + gap
    track.style.transform = `translateX(-${carouselIdx * cardW}px)`
  }, [carouselIdx])

  // Resize: clamp carousel index
  useEffect(() => {
    function onResize() {
      const vis = window.innerWidth <= 560 ? 1 : window.innerWidth <= 900 ? 2 : 3
      const maxIdx = Math.max(0, CARDS.length - vis)
      setCarouselIdx(prev => Math.min(prev, maxIdx))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Search overlay keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSearchOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Focus overlay input when search opens
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => overlayInputRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  function openSearch(val?: string) {
    setSearchOpen(true)
    if (val !== undefined) setOverlaySearch(val)
  }

  function getMaxIdx() {
    const vis = typeof window !== 'undefined'
      ? (window.innerWidth <= 560 ? 1 : window.innerWidth <= 900 ? 2 : 3)
      : 3
    return Math.max(0, CARDS.length - vis)
  }

  function showToast(msg: string) {
    setToastMsg(msg)
    setToastVisible(true)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3200)
  }

  const moonSvg = <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
  const sunSvg = (
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  )

  return (
    <>
      <div className="bg bg-night" ref={bgNightRef} />
      <div className="bg bg-day" ref={bgDayRef} />
      <div className="grain" />
      <div className="progress" ref={progressRef} />

      {/* SEARCH OVERLAY */}
      <div
        className={`search-overlay${searchOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false) }}
      >
        <button className="search-close" onClick={() => setSearchOpen(false)}>
          <svg className="ico" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
        <div className="search-wrap">
          <div className="ov-input-row">
            <input
              ref={overlayInputRef}
              type="text"
              placeholder="Search stories, moods, authors…"
              autoComplete="off"
              value={overlaySearch}
              onChange={e => setOverlaySearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <div className="fg">
              <h4>Genre</h4>
              {['Fiction','Poetry','Essay','Translation','Interview','Culture'].map(g => (
                <label key={g}><input type="checkbox" /> {g}</label>
              ))}
            </div>
            <div className="fg">
              <h4>Mood</h4>
              {['Dark & unsettling','Tender & quiet','Strange & surreal','Hopeful','Angry & urgent','Funny & sharp'].map(m => (
                <label key={m}><input type="checkbox" /> {m}</label>
              ))}
            </div>
            <div className="fg">
              <h4>Rating</h4>
              {['All readers','15+','18+ (mature)'].map(r => (
                <label key={r}><input type="checkbox" /> {r}</label>
              ))}
              <h4 style={{ marginTop: '1.2rem' }}>Read time</h4>
              {['Under 5 min','5 – 15 min','15+ min'].map(t => (
                <label key={t}><input type="checkbox" /> {t}</label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toastMsg}</div>

      {/* HEADER */}
      <header ref={headerRef}>
        <div className="shell bar">
          <Link className="brand" href="/">
            <span className="en">Kalponeek</span>
            <span className="div" />
            <span className="bn">কাল্পনিক</span>
          </Link>
          <div className="header-search">
            <span className="s-icon">
              <svg className="ico" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </span>
            <input
              ref={inlineSearchRef}
              type="text"
              placeholder="Search stories, moods, authors…"
              aria-label="Search"
              onFocus={e => openSearch(e.currentTarget.value)}
              onKeyDown={e => { if (e.key === 'Enter') openSearch(e.currentTarget.value) }}
            />
          </div>
          <div className="hdr-right">
            <nav>
              <a href="#latest">Stories</a>
              <a href="#cats">Genres</a>
              <a href="#submit">Submit</a>
            </nav>
            <a className="pill signin" href="#">Sign in</a>
            <button
              className="pill mode-btn"
              onClick={() => setIsDay(d => !d)}
              aria-label="Toggle day/night mode"
            >
              <svg className="mode-icon" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" fill="none" strokeLinecap="round">
                {isDay ? sunSvg : moonSvg}
              </svg>
            </button>
            <button className="menu-btn" aria-label="Menu">
              <svg width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="5" x2="18" y2="5" />
                <line x1="2" y1="12" x2="18" y2="12" />
                <line x1="2" y1="19" x2="18" y2="19" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MASTHEAD */}
      <div className="masthead shell">
        <p className="eyebrow load-in d1">Issue 01 · Read after dark</p>
        <h1 className="wordmark load-in d2" ref={wordmarkRef}>Kalponeek</h1>
        <p className="bangla-title load-in d3">কাল্পনিক</p>
        <p className="manifesto load-in d3">A magazine of fiction, essays, poetry, and everything in between.</p>
        <div className="load-in d4">
          <button
            className="random-btn"
            onClick={() => {
              const title = STORIES[Math.floor(Math.random() * STORIES.length)]
              showToast(`Taking you to: "${title}"`)
            }}
          >
            <svg viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="3" />
              <circle cx="8" cy="8" r="1.2" fill="currentColor" />
              <circle cx="16" cy="8" r="1.2" fill="currentColor" />
              <circle cx="12" cy="12" r="1.2" fill="currentColor" />
              <circle cx="8" cy="16" r="1.2" fill="currentColor" />
              <circle cx="16" cy="16" r="1.2" fill="currentColor" />
            </svg>
            Take me somewhere random
          </button>
        </div>
      </div>
      <div className="rule" />

      {/* LEAD */}
      <section>
        <div className="shell">
          <div className="sec-head reveal">
            <span className="sec-title">The lead</span>
            <a className="sec-more" href="#">All features →</a>
          </div>
          <article className="lead">
            <div className="art reveal clip">
              <div className="art-fill scene-a" data-par="" />
            </div>
            <div className="reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div className="tags">
                <span className="tag cat">Fiction</span>
                <span className="tag r15">15+</span>
                <span className="tag">12 min read</span>
              </div>
              <h2><Link href="/articles/the-cartographers-of-sleep">The Cartographers of Sleep</Link></h2>
              <p className="dek">In a city where dreams are surveyed and sold, one mapmaker keeps a private atlas of the places no one is meant to remember.</p>
              <p className="byline">By <b>Anwesha Rahman</b> · Short story</p>
            </div>
          </article>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="cats" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="cats-head reveal">
            <span className="sec-title">Read by category</span>
            <button
              className="collapse-btn"
              aria-expanded={catsOpen}
              onClick={() => setCatsOpen(o => !o)}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
                {catsOpen
                  ? <polyline points="1,7 5,3 9,7" />
                  : <polyline points="1,3 5,7 9,3" />
                }
              </svg>
              <span>{catsOpen ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
          <div className="cats-body reveal" ref={catsBodyRef}>
            <div className="rail-outer">
              <div className="rail">
                {[
                  ['Fiction',42],['Poetry',28],['Essays',35],['Translation',17],
                  ['Interviews',11],['Reviews',23],['Culture',19],['Mature 18+',9],
                  ['Dark & unsettling',null],['Tender & quiet',null],['Strange & surreal',null],['Under 5 min',null],
                  ['Fiction',42],['Poetry',28],['Essays',35],['Translation',17],
                  ['Interviews',11],['Reviews',23],['Culture',19],['Mature 18+',9],
                  ['Dark & unsettling',null],['Tender & quiet',null],['Strange & surreal',null],['Under 5 min',null],
                ].map(([label, count], i) => (
                  <a key={i} className="chip" href="#">
                    {label}{count != null && <span className="n">{count}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST */}
      <section id="latest">
        <div className="shell">
          <div className="sec-head reveal">
            <span className="sec-title">Latest</span>
            <a className="sec-more" href="#">Browse all →</a>
          </div>
          <div className="carousel-track-wrap">
            <div className="carousel-track" ref={carouselTrackRef}>
              {CARDS.map((card, i) => (
                <article
                  key={i}
                  className={`card reveal${card.mature && !revealedCards.has(card.slug) ? ' locked' : ''}`}
                >
                  <div className="art">
                    <div className={`art-fill ${card.scene}`} data-par="" />
                    {card.mature && !revealedCards.has(card.slug) && (
                      <div className="lock">
                        <svg className="lock-ic" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <span>18+ — mature themes</span>
                        <button
                          onClick={() => setRevealedCards(s => new Set([...s, card.slug]))}
                        >
                          Confirm age to read
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="tags">
                    <span className="tag cat">{card.cat}</span>
                    {card.rating === '18+' && <span className="tag r18">18+</span>}
                    {card.rating === '15+' && <span className="tag r15">15+</span>}
                    {card.label && <span className="tag">{card.label}</span>}
                  </div>
                  <h3><Link href={`/articles/${card.slug}`}>{card.title}</Link></h3>
                  <p>{card.dek}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="carousel-arrows reveal">
            <button
              className="c-arrow"
              disabled={carouselIdx === 0}
              onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
              aria-label="Previous"
            >←</button>
            <button
              className="c-arrow"
              disabled={carouselIdx >= getMaxIdx()}
              onClick={() => setCarouselIdx(i => Math.min(getMaxIdx(), i + 1))}
              aria-label="Next"
            >→</button>
          </div>
        </div>
      </section>

      {/* FEATURED AUTHOR */}
      <section>
        <div className="shell">
          <div className="author-spot reveal">
            <div className="author-avatar"><div className="avatar-fill" /></div>
            <div>
              <p className="author-label">Featured author</p>
              <h3 className="author-name">Anwesha Rahman</h3>
              <p className="author-bio">A fiction writer based in Dhaka whose stories live at the edge of the ordinary and the dreamlike. Published in three countries, translated into two languages.</p>
              <a className="author-link" href="#">Read all her work →</a>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <section>
        <div className="shell pull reveal">
          <blockquote>"We made Kalponeek for the things that only get said after dark — and for the readers awake to hear them."</blockquote>
          <cite>From the editors</cite>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section>
        <div className="shell reveal">
          <div className="newsletter">
            <h3>Read in your inbox</h3>
            <p>New stories, essays, and poetry delivered every fortnight. No noise, no spam.</p>
            <div className="nl-form">
              <input className="nl-input" type="email" placeholder="your@email.com" />
              <button className="nl-btn">Subscribe</button>
            </div>
          </div>
        </div>
      </section>

      {/* AD */}
      <section>
        <div className="shell reveal">
          <div className="ad">
            <p className="lab">Advertisement</p>
            <p className="slot">Ad slot — ready for AdSense once the magazine is live</p>
          </div>
        </div>
      </section>

      {/* SUBMIT */}
      <section className="submit" id="submit">
        <div className="shell reveal">
          <h2>Have something to say?</h2>
          <p>We read fiction, essays, poetry, and translations year-round. Submissions are open.</p>
          <a className="btn" href="#">Submit your writing</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="shell foot">
          <div>
            <div className="f-en">Kalponeek</div>
            <span className="f-bn">কাল্পনিক</span>
            <small>A magazine of the imagined and the true</small>
          </div>
          <nav>
            <a href="#">About</a>
            <a href="#">Submit</a>
            <a href="#">Masthead</a>
            <a href="#">Contact</a>
          </nav>
          <nav>
            <a href="#">Newsletter</a>
            <a href="#">Instagram</a>
            <a href="#">RSS</a>
            <a href="#">Privacy</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
