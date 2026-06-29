'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminLogout, updateSubmissionStatus, updateSubmissionNotes } from '../_actions/admin'
import type { Submission } from '../_lib/database.types'

const STATUSES = ['pending', 'under review', 'accepted', 'rejected'] as const
const GENRES = ['All genres', 'Fiction', 'Poetry', 'Essay', 'Translation', 'Interview', 'Culture']
const STATUS_FILTERS = ['all', ...STATUSES] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]
type Tab = 'piece' | 'cover' | 'bio'

function badgeClass(status: string): string {
  if (status === 'under review') return 'badge-review'
  if (status === 'accepted') return 'badge-accepted'
  if (status === 'rejected') return 'badge-rejected'
  return 'badge-pending'
}

function statusSlug(status: string): string {
  if (status === 'under review') return 'ss-review'
  if (status === 'accepted') return 'ss-accepted'
  if (status === 'rejected') return 'ss-rejected'
  return 'ss-pending'
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function AdminClient({ submissions: initial }: { submissions: Submission[] }) {
  const headerRef = useRef<HTMLElement>(null)
  const router = useRouter()

  const [submissions, setSubmissions] = useState<Submission[]>(initial)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [genreFilter, setGenreFilter] = useState('All genres')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('piece')
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  // Sticky header
  useEffect(() => {
    const hdr = headerRef.current
    if (!hdr) return
    const h = () => hdr.classList.toggle('stuck', window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // ESC closes panel
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Sync notes when selection changes
  const selected = submissions.find(s => s.id === selectedId) ?? null
  useEffect(() => {
    if (selected) {
      setNotes(selected.internal_notes ?? '')
      setNotesSaved(false)
    }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered list
  const filtered = submissions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (genreFilter !== 'All genres' && s.genre !== genreFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.full_name.toLowerCase().includes(q) &&
        !s.story_title.toLowerCase().includes(q) &&
        !s.email.toLowerCase().includes(q) &&
        !s.reference_number.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  // Stats (always from full list)
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    review: submissions.filter(s => s.status === 'under review').length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  function openDetail(s: Submission) {
    setSelectedId(s.id)
    setActiveTab('piece')
  }

  async function handleLogout() {
    await adminLogout()
    router.refresh()
  }

  async function handleStatusChange(id: string, status: string) {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    try { await updateSubmissionStatus(id, status) } catch { /* optimistic — ignore */ }
  }

  async function handleSaveNotes() {
    if (!selectedId) return
    setSavingNotes(true)
    setSubmissions(prev => prev.map(s => s.id === selectedId ? { ...s, internal_notes: notes || null } : s))
    try {
      await updateSubmissionNotes(selectedId, notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2500)
    } catch { /* ignore */ } finally {
      setSavingNotes(false)
    }
  }

  const STATUS_LABEL: Record<string, string> = {
    'pending': 'Pending',
    'under review': 'Under Review',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
  }

  return (
    <>
      <div className="bg bg-night" />
      <div className="grain" />

      <header ref={headerRef} style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="shell bar">
          <Link className="brand" href="/">
            <span className="en">Kalponeek</span>
            <span className="div" />
            <span className="bn">কাল্পনিক</span>
          </Link>
          <span className="back">Editorial Admin</span>
          <div className="hdr-right">
            <Link href="/submit" className="pill">Submit portal</Link>
            <button className="pill" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="shell">

          {/* Stats */}
          <div className="admin-stats">
            {([
              ['as-total',    'Total',        stats.total],
              ['as-pending',  'Pending',       stats.pending],
              ['as-review',   'Under Review',  stats.review],
              ['as-accepted', 'Accepted',      stats.accepted],
              ['as-rejected', 'Rejected',      stats.rejected],
            ] as const).map(([cls, lab, num]) => (
              <div key={cls} className={`admin-stat ${cls}`}>
                <div className="admin-stat-num">{num}</div>
                <div className="admin-stat-lab">{lab}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="admin-filters">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                className={`af-btn${statusFilter === f ? ' active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_LABEL[f] ?? f}
              </button>
            ))}

            <div className="af-sep" />

            <select
              className="af-select"
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <input
              type="text"
              className="af-search"
              placeholder="Search name, title, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <span className="af-count">{filtered.length} submission{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Title / Author</th>
                  <th>Genre</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-rows">No submissions match the current filters.</td>
                  </tr>
                ) : filtered.map(s => (
                  <tr
                    key={s.id}
                    className={selectedId === s.id ? 'row-active' : ''}
                    onClick={() => openDetail(s)}
                  >
                    <td><span className="at-ref">{s.reference_number}</span></td>
                    <td>
                      <div className="at-title">{s.story_title}</div>
                      <div className="at-author">{s.full_name} · {s.email}</div>
                    </td>
                    <td>
                      <div className="at-genre">{s.genre}</div>
                      <div className="at-rating">{s.content_rating}</div>
                    </td>
                    <td><span className="at-date">{fmtDate(s.created_at)}</span></td>
                    <td>
                      <span className={`status-badge ${badgeClass(s.status)}`}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Detail drawer */}
      <div
        className={`admin-scrim${selectedId ? ' open' : ''}`}
        onClick={() => setSelectedId(null)}
      />
      <div className={`admin-detail${selectedId ? ' open' : ''}`}>
        {selected && (
          <>
            <div className="detail-head">
              <button className="detail-close" onClick={() => setSelectedId(null)} aria-label="Close">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <h2>{selected.story_title}</h2>
            </div>

            <div className="detail-meta">
              <span className="dm">By <b>{selected.full_name}</b></span>
              <span className="dm">Email: <b><a href={`mailto:${selected.email}`}>{selected.email}</a></b></span>
              <span className="dm">Genre: <b>{selected.genre}</b></span>
              <span className="dm">Rating: <b>{selected.content_rating}</b></span>
              <span className="dm">Submitted: <b>{fmtDate(selected.created_at)}</b></span>
              <span className="dm">Ref: <b>{selected.reference_number}</b></span>
              {selected.previously_published && (
                <span className="dm" style={{ color: 'var(--gilt)' }}>Previously published</span>
              )}
            </div>

            <div className="detail-tabs">
              {(['piece', 'cover', 'bio'] as Tab[]).map(t => (
                <button
                  key={t}
                  className={`detail-tab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'piece' ? 'The Piece' : t === 'cover' ? 'Cover Letter' : 'Bio'}
                </button>
              ))}
            </div>

            <div className={`detail-content piece${(!selected.piece && activeTab === 'piece') || (!selected.cover_letter && activeTab === 'cover') || (!selected.bio && activeTab === 'bio') ? ' empty' : ''}`}>
              {activeTab === 'piece' && (selected.piece || 'No piece provided.')}
              {activeTab === 'cover' && (selected.cover_letter || 'No cover letter provided.')}
              {activeTab === 'bio' && (selected.bio || 'No bio provided.')}
            </div>

            <div className="status-control">
              <div className="sc-label">Change status</div>
              <div className="status-seg">
                {STATUSES.map(st => (
                  <button
                    key={st}
                    className={[
                      statusSlug(st),
                      selected.status === st ? 'ss-active' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleStatusChange(selected.id, st)}
                  >
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>

            <div className="notes-section">
              <div className="ns-label">Internal notes</div>
              <textarea
                placeholder="Notes visible to editors only — not shared with the writer."
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesSaved(false) }}
                rows={4}
              />
              <button
                className={`notes-save${notesSaved ? ' saved' : ''}`}
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {notesSaved ? '✓ Saved' : savingNotes ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
