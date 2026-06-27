'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Article, Comment } from '../_lib/database.types'

const FONT_MAP: Record<string, string> = {
  'Spectral': '"Spectral", Georgia, serif',
  'Fraunces': '"Fraunces", Georgia, serif',
  'Lexend': '"Lexend", sans-serif',
  'Atkinson Hyperlegible': '"Atkinson Hyperlegible", sans-serif',
}

const MOCK_ARTICLE: Article = {
  id: 'mock-1',
  slug: 'the-cartographers-of-sleep',
  title: 'The Cartographers of Sleep',
  subtitle: 'In a city where dreams are surveyed and sold, one mapmaker keeps a private atlas of the places no one is meant to remember.',
  category: 'Fiction',
  rating: '15+',
  read_time: 12,
  author_name: 'Anwesha Rahman',
  author_bio: 'A fiction writer based in Dhaka whose stories live at the edge of the ordinary and the dreamlike. Published in three countries and translated into two languages. "The Cartographers of Sleep" is her first appearance in Kalponeek.',
  published_at: 'March 14',
  content: '',
  scene: 'scene-a',
  created_at: '',
}

const MOCK_COMMENTS: Comment[] = [
  { id: '1', article_id: 'mock-1', author_name: 'Imran S.', body: 'The last image stayed with me all morning. That final line about choosing — extraordinary.', created_at: '2 days ago' },
  { id: '2', article_id: 'mock-1', author_name: 'Nadia K.', body: 'I read this twice. The idea of an "unmappable wound" in a public record is going to live in my head for a while.', created_at: '3 days ago' },
  { id: '3', article_id: 'mock-1', author_name: 'Rafiq T.', body: 'More from this author please. The world-building in so few words is remarkable.', created_at: '4 days ago' },
]

type Props = {
  article: Article | null
  comments?: Comment[]
}

export default function ArticleClient({ article: propArticle, comments: propComments }: Props) {
  const article = propArticle ?? MOCK_ARTICLE
  const comments = propComments ?? MOCK_COMMENTS

  const [theme, setTheme] = useState<'night' | 'day' | 'sepia' | 'contrast'>('night')
  const [font, setFont] = useState('Spectral')
  const [fontSize, setFontSize] = useState(1.27)
  const [lineHeight, setLineHeight] = useState(1.85)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [columnWidth, setColumnWidth] = useState('40rem')
  const [dyslexia, setDyslexia] = useState(false)
  const [rulerOn, setRulerOn] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [hideImages, setHideImages] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [localComments, setLocalComments] = useState<Comment[]>(comments)

  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const articleBodyRef = useRef<HTMLDivElement>(null)

  // Apply theme to body
  useEffect(() => {
    const body = document.body
    body.className = body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .concat(`theme-${theme}`)
      .join(' ')
      .trim()
  }, [theme])

  // Apply reading CSS vars to root
  useEffect(() => {
    document.documentElement.style.setProperty('--rfont', FONT_MAP[font] ?? FONT_MAP.Spectral)
  }, [font])

  useEffect(() => {
    document.documentElement.style.setProperty('--rsize', fontSize.toFixed(2) + 'rem')
  }, [fontSize])

  useEffect(() => {
    document.documentElement.style.setProperty('--rlead', lineHeight.toFixed(2))
  }, [lineHeight])

  useEffect(() => {
    document.documentElement.style.setProperty('--rtrack', letterSpacing.toFixed(2) + 'em')
  }, [letterSpacing])

  useEffect(() => {
    document.documentElement.style.setProperty('--rwidth', columnWidth)
  }, [columnWidth])

  // Accessibility body classes
  useEffect(() => { document.body.classList.toggle('ruler-on', rulerOn) }, [rulerOn])
  useEffect(() => { document.body.classList.toggle('focus', focusMode) }, [focusMode])
  useEffect(() => { document.body.classList.toggle('hide-img', hideImages) }, [hideImages])
  useEffect(() => { document.body.classList.toggle('no-motion', reduceMotion) }, [reduceMotion])

  // Dyslexia mode
  useEffect(() => {
    const root = document.documentElement
    if (dyslexia) {
      root.style.setProperty('--rfont', FONT_MAP['Atkinson Hyperlegible'])
      root.style.setProperty('--rtrack', '0.03em')
      if (lineHeight < 2.0) setLineHeight(2.0)
    } else {
      root.style.setProperty('--rfont', FONT_MAP[font])
      root.style.setProperty('--rtrack', '0em')
      setLetterSpacing(0)
    }
  }, [dyslexia])

  // Scroll: header stuck, progress bar, parallax
  useEffect(() => {
    let ticking = false
    function onScroll() {
      const y = window.scrollY
      const wh = window.innerHeight
      const docH = document.documentElement.scrollHeight - wh
      headerRef.current?.classList.toggle('stuck', y > 30)
      if (progressRef.current) {
        progressRef.current.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%'
      }
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

  // Reading ruler follows cursor
  useEffect(() => {
    if (!rulerOn) return
    const handler = (e: MouseEvent) => {
      if (rulerRef.current) rulerRef.current.style.top = (e.clientY - 19) + 'px'
    }
    document.addEventListener('mousemove', handler)
    return () => document.removeEventListener('mousemove', handler)
  }, [rulerOn])

  // Panel keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setPanelOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function handleListen() {
    if (!('speechSynthesis' in window)) return
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = articleBodyRef.current?.innerText ?? ''
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.96
    u.onend = () => setSpeaking(false)
    speechSynthesis.speak(u)
    setSpeaking(true)
  }

  function handleCopy(btn: HTMLButtonElement) {
    navigator.clipboard?.writeText(window.location.href)
    const orig = btn.textContent
    btn.textContent = 'Link copied'
    setTimeout(() => { btn.textContent = orig }, 1600)
  }

  function applyDyslexia(on: boolean) {
    setDyslexia(on)
    if (on) {
      setFont('Atkinson Hyperlegible')
    } else {
      setFont('Spectral')
    }
  }

  const sizePercent = Math.round(fontSize / 1.27 * 100)

  return (
    <>
      <div className="bg bg-night" />
      <div className="grain" />
      <div className="progress" ref={progressRef} />
      <div className="ruler" ref={rulerRef} />

      {/* HEADER */}
      <header ref={headerRef}>
        <div className="shell bar">
          <Link className="brand" href="/">
            <span className="en">Kalponeek</span>
            <span className="div" />
            <span className="bn">কাল্পনিক</span>
          </Link>
          <Link className="back" href="/">← All stories</Link>
          <div className="hdr-right">
            <button className="pill" onClick={() => setPanelOpen(true)}>
              <span className="aa">Aa</span> Reading
            </button>
            <a className="pill" href="#" style={{ color: 'var(--paper)' }}>Sign in</a>
          </div>
        </div>
      </header>

      {/* ARTICLE */}
      <article className="article">
        <div className="shell">
          <div className="art-head">
            <div className="meta-top">
              <span className="tag cat">{article.category}</span>
              {article.rating !== 'all' && (
                <span className={`tag ${article.rating === '18+' ? 'r18' : 'r15'}`}>{article.rating}</span>
              )}
              <span className="tag">{article.read_time} min read</span>
            </div>
            <h1 className="title">{article.title}</h1>
            <p className="dek">{article.subtitle}</p>
            <div className="byrow">
              <div className="author-mini">
                <div className="av" />
                <div className="nm">
                  {article.author_name}
                  <small>{article.published_at} · Short story</small>
                </div>
              </div>
              <div className="by-actions">
                <button className="icon-btn" onClick={handleListen}>
                  {speaking ? (
                    <>
                      <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none" /></svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24"><polygon points="5,4 15,12 5,20" fill="currentColor" stroke="none" /></svg>
                      Listen
                    </>
                  )}
                </button>
                <button className="icon-btn" onClick={e => handleCopy(e.currentTarget)}>
                  <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /><line x1="15.5" y1="6.5" x2="8.5" y2="10.5" /></svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="cover">
          <div className={`cover-fill ${article.scene}`} data-par="" />
        </div>

        {/* Article body — use content from DB or fall back to mock prose */}
        <div className="article-body" id="articleBody" ref={articleBodyRef}>
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <>
              <p className="first">The bureau of sleep opened at dusk, when the rest of the city was learning to forget the day. Maheen arrived before the lamps were lit, as she always did, and let herself in through the narrow door behind the cartography hall. The drafting tables waited in their rows like patient animals. She did not turn on the overhead lights. She preferred to work by the glow of the survey lanterns, which threw the coastlines of other people's dreams across the ceiling.</p>
              <p>Every citizen surrendered their dreams now. It had been law for eleven years. You slept, and in the morning the collectors came with their soft machines and drew the night out of you like water from a well, and what they took was charted, indexed, and sold. There were buyers for everything — the pharmaceutical houses, the advertisers, the ministries that liked to know what the population feared before the population knew it themselves.</p>
              <p>Maheen was the best cartographer the bureau had. She could take the raw recording of a dream and render it as a map so precise that a stranger could walk it. This made her valuable. It also made her dangerous, though no one had noticed yet, because somewhere in the work she had learned to do the opposite — to take a map and leave a part of it off. To make a place unfindable.</p>
              <h2>The unmarked districts</h2>
              <p>She kept her private atlas in the hollow of a drafting table, beneath a false bottom she had cut herself. It held the places she had refused to surrender: a grandmother's kitchen that no longer existed in any waking city, a beach where the tide came in backwards, a man whose face she would not let the buyers have. She had stolen them back one fragment at a time, and each theft was a small unmappable wound in the great record.</p>
              <p className="pullquote">"A map is a promise that a place can be found again. She had spent her life learning how to break that promise gently."</p>
              <p>The danger, of course, was the audit. Once a season the inspectors came through with their reconciliation engines, comparing what had been collected against what had been charted, looking for the gap between them. A discrepancy was treason. Maheen had survived three audits by feeding the engines decoys — dull, plausible dreams she manufactured herself, grey little things about queuing and rain.</p>
              <p>But the fourth audit was different, because this time the inspector was someone she knew.</p>
              <p>He came in out of the evening with frost still on his coat and stood at the threshold the way the drafting tables stood, patient and waiting, and when he said her name it was in the voice from the map she had refused to surrender — the one place in her atlas with a human face. She understood then that the bureau had not sent a stranger to find her gap. It had sent the very thing she had been protecting, to see whether she would chart it at last, or let herself be found instead.</p>
              <p>She reached beneath the drafting table. Outside, the lamps were coming on across the city, one by one, the way they did every night, lighting the streets that everyone could find and none of them remembered choosing.</p>
            </>
          )}
        </div>

        <div className="inline-ad">
          <p className="lab">Advertisement</p>
          <p className="slot">Ad slot — ready for AdSense once the magazine is live</p>
        </div>

        <div className="end-share">
          <span className="lab">Share this story</span>
          <div className="share-row">
            <button className="icon-btn" onClick={e => handleCopy(e.currentTarget)}>
              <svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>
              Copy link
            </button>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24"><path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h3z" /></svg>
              Facebook
            </button>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" strokeWidth="2" /></svg>
              X
            </button>
          </div>
        </div>

        <div className="author-card">
          <div className="av" />
          <div>
            <p className="lab">About the author</p>
            <h4>{article.author_name}</h4>
            <p>{article.author_bio}</p>
          </div>
        </div>

        {/* COMMENTS */}
        <div className="comments">
          <h3>Comments · {localComments.length}</h3>
          <div className="cbox">
            <div className="av" />
            <textarea
              placeholder="Add to the conversation…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && newComment.trim()) {
                  setLocalComments(prev => [{
                    id: Date.now().toString(),
                    article_id: article.id,
                    author_name: 'You',
                    body: newComment.trim(),
                    created_at: 'just now',
                  }, ...prev])
                  setNewComment('')
                }
              }}
            />
          </div>
          {localComments.map(c => (
            <div key={c.id} className="comment">
              <div className="av" />
              <div className="body">
                <div className="who">
                  {c.author_name}
                  <small>{c.created_at}</small>
                </div>
                <p>{c.body}</p>
                <span className="act">Reply</span>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* RELATED */}
      <section className="related">
        <div className="shell">
          <p className="sec-title">More like this</p>
          <div className="rel-grid">
            {[
              { f: 'background:radial-gradient(70% 60% at 70% 25%,#2c3340,transparent 60%),linear-gradient(160deg,#1a1620,#0f0c10)', title: 'Notes on a City That Forgets', meta: 'Tahmid Karim · Essay', slug: 'notes-on-a-city-that-forgets' },
              { f: 'background:radial-gradient(75% 65% at 25% 30%,#3a3320,transparent 60%),linear-gradient(160deg,#231d12,#100d08)', title: 'Saltwater Liturgy', meta: 'Mira Sengupta · Poetry', slug: 'saltwater-liturgy' },
              { f: 'background:radial-gradient(75% 65% at 35% 25%,#1f3a34,transparent 60%),linear-gradient(160deg,#13201c,#0a100d)', title: 'What the River Kept', meta: 'Translation', slug: 'what-the-river-kept' },
            ].map(card => (
              <article key={card.slug} className="rcard">
                <div className="art"><div className="f" style={{ background: card.f.replace('background:', '') }} /></div>
                <h4><Link href={`/articles/${card.slug}`}>{card.title}</Link></h4>
                <p>{card.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="slim">
        <div className="shell foot">
          <div className="f-en">Kalponeek</div>
          <small>A magazine of the imagined and the true</small>
        </div>
      </footer>

      {/* FAB */}
      <div className="fab">
        <button onClick={() => setPanelOpen(true)} aria-label="Reading settings">
          <span className="aa">Aa</span>
        </button>
      </div>

      {/* READING PANEL */}
      <div
        className={`panel-scrim${panelOpen ? ' open' : ''}`}
        onClick={() => setPanelOpen(false)}
      />
      <aside
        className={`panel${panelOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Reading settings"
        aria-modal="true"
      >
        <div className="panel-head">
          <h3>Reading</h3>
          <button className="panel-close" onClick={() => setPanelOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Theme */}
        <div className="pgroup">
          <label>Theme</label>
          <div className="seg theme-seg">
            {(['night','day','sepia','contrast'] as const).map(t => (
              <button
                key={t}
                className={theme === t ? 'active' : ''}
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Typeface */}
        <div className="pgroup">
          <label>Typeface</label>
          <div className="seg font-seg">
            {[
              ['Spectral', 'Spectral — literary serif'],
              ['Fraunces', 'Fraunces — display serif'],
              ['Lexend', 'Lexend — easy reading'],
              ['Atkinson Hyperlegible', 'Atkinson — high legibility'],
            ].map(([key, label]) => (
              <button
                key={key}
                data-font={key}
                className={font === key ? 'active' : ''}
                onClick={() => { setFont(key); if (dyslexia) setDyslexia(false) }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Text size */}
        <div className="pgroup">
          <label>Text size</label>
          <div className="stepper">
            <button onClick={() => setFontSize(s => Math.max(0.95, +(s - 0.08).toFixed(2)))} aria-label="Smaller">−</button>
            <span className="val">{sizePercent}%</span>
            <button onClick={() => setFontSize(s => Math.min(1.9, +(s + 0.08).toFixed(2)))} aria-label="Larger">+</button>
          </div>
        </div>

        {/* Line spacing */}
        <div className="pgroup">
          <label>Line spacing</label>
          <div className="stepper">
            <button onClick={() => setLineHeight(l => Math.max(1.3, +(l - 0.1).toFixed(2)))} aria-label="Tighter">−</button>
            <span className="val">{lineHeight.toFixed(2)}</span>
            <button onClick={() => setLineHeight(l => Math.min(2.6, +(l + 0.1).toFixed(2)))} aria-label="Looser">+</button>
          </div>
        </div>

        {/* Letter spacing */}
        <div className="pgroup">
          <label>Letter spacing</label>
          <div className="stepper">
            <button onClick={() => setLetterSpacing(t => Math.max(0, +(t - 0.01).toFixed(2)))} aria-label="Tighter">−</button>
            <span className="val">{letterSpacing === 0 ? '0' : letterSpacing.toFixed(2) + 'em'}</span>
            <button onClick={() => setLetterSpacing(t => Math.min(0.12, +(t + 0.01).toFixed(2)))} aria-label="Wider">+</button>
          </div>
        </div>

        {/* Column width */}
        <div className="pgroup">
          <label>Column width</label>
          <div className="seg">
            {[['34rem','Narrow'],['40rem','Medium'],['52rem','Wide']].map(([w, label]) => (
              <button
                key={w}
                className={columnWidth === w ? 'active' : ''}
                onClick={() => setColumnWidth(w)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="pgroup">
          <label>Accessibility</label>
          <div className="toggle-row">
            <span>Dyslexia-friendly<small>Atkinson font + wider spacing</small></span>
            <button
              className={`sw${dyslexia ? ' on' : ''}`}
              onClick={() => applyDyslexia(!dyslexia)}
              aria-pressed={dyslexia}
            />
          </div>
          <div className="toggle-row">
            <span>Reading ruler<small>Highlight line follows cursor</small></span>
            <button
              className={`sw${rulerOn ? ' on' : ''}`}
              onClick={() => setRulerOn(r => !r)}
              aria-pressed={rulerOn}
            />
          </div>
          <div className="toggle-row">
            <span>Focus mode<small>Hide everything but the text</small></span>
            <button
              className={`sw${focusMode ? ' on' : ''}`}
              onClick={() => setFocusMode(f => !f)}
              aria-pressed={focusMode}
            />
          </div>
          <div className="toggle-row">
            <span>Hide images<small>Fewer distractions</small></span>
            <button
              className={`sw${hideImages ? ' on' : ''}`}
              onClick={() => setHideImages(h => !h)}
              aria-pressed={hideImages}
            />
          </div>
          <div className="toggle-row">
            <span>Reduce motion<small>Turn off animations</small></span>
            <button
              className={`sw${reduceMotion ? ' on' : ''}`}
              onClick={() => setReduceMotion(m => !m)}
              aria-pressed={reduceMotion}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
