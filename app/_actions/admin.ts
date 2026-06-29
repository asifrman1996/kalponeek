'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '../_lib/supabase-server'
import type { Submission } from '../_lib/database.types'

// Set ADMIN_PASSWORD in your .env.local and in Render's environment variables.
// Default is only for local dev — change it before deploying.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'kalponeek2026'

async function verifyAdmin(): Promise<void> {
  const store = await cookies()
  if (store.get('admin-session')?.value !== 'authenticated') {
    throw new Error('Unauthorized')
  }
}

export async function adminLogin(password: string): Promise<void> {
  if (password !== ADMIN_PASSWORD) throw new Error('Incorrect password.')
  const store = await cookies()
  store.set('admin-session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
    sameSite: 'lax',
  })
}

export async function adminLogout(): Promise<void> {
  const store = await cookies()
  store.delete('admin-session')
}

export async function getSubmissions(): Promise<Submission[]> {
  await verifyAdmin()
  const supabase = createServerClient()
  const { data } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Submission[]
}

export async function updateSubmissionStatus(id: string, status: string): Promise<void> {
  await verifyAdmin()
  const supabase = createServerClient()
  await supabase.from('submissions').update({ status }).eq('id', id)
}

export async function updateSubmissionNotes(id: string, notes: string): Promise<void> {
  await verifyAdmin()
  const supabase = createServerClient()
  await supabase.from('submissions').update({ internal_notes: notes || null }).eq('id', id)
}
