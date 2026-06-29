import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import AdminLogin from '../_components/AdminLogin'
import AdminClient from '../_components/AdminClient'
import { getSubmissions } from '../_actions/admin'

export const metadata: Metadata = {
  title: 'Admin — Kalponeek',
  robots: { index: false, follow: false },
}

// Never cache the admin page — always check the cookie fresh
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const store = await cookies()
  const isAuth = store.get('admin-session')?.value === 'authenticated'

  if (!isAuth) return <AdminLogin />

  const submissions = await getSubmissions()
  return <AdminClient submissions={submissions} />
}
