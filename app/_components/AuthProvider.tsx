'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../_lib/supabase'
import AuthModal from './AuthModal'

interface AuthContextValue {
  user: User | null
  displayName: string
  openAuthModal: () => void
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  displayName: '',
  openAuthModal: () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
    setDisplayName((data as { display_name?: string } | null)?.display_name ?? '')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else setDisplayName('')
    })

    return () => subscription.unsubscribe()
  }, [])

  const openAuthModal = useCallback(() => setModalOpen(true), [])
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, displayName, openAuthModal, signOut }}>
      {children}
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AuthContext.Provider>
  )
}
