'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '../_actions/admin'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await adminLogin(password)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg bg-night" />
      <div className="grain" />
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-logo">
            Kalponeek <span>Admin</span>
          </div>
          <div className="admin-sub">Editorial Dashboard</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="pwd">Password</label>
              <input
                id="pwd"
                type="password"
                className="fi"
                required
                autoFocus
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn admin-login-btn" disabled={loading}>
              {loading ? 'Checking…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
