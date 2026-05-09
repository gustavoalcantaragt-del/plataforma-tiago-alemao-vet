// ─────────────────────────────────────────────
// AUTH CONTEXT — Supabase real
// ─────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase } from '../lib/supabase'
import { MOCK_OWNER } from '../data/mock'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const MOCK_SESSION_KEY = 'nl_mock_session'

async function fetchProfile(userId: string): Promise<User | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, role, created_at')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Modo demo: sem Supabase, usa sessão mock persistida no localStorage
    if (!supabase) {
      const saved = localStorage.getItem(MOCK_SESSION_KEY)
      if (saved) {
        try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (profile) setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string) {
    // Modo demo: aceita qualquer credencial e loga como owner
    if (!supabase) {
      if (!email || !password) return { error: 'Preencha e-mail e senha.' }
      const mockUser: User = { ...MOCK_OWNER, email, name: email.split('@')[0] }
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return {}
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      const profile = await fetchProfile(data.user.id)
      if (profile) setUser(profile)
    }
    return {}
  }

  async function signup(name: string, email: string, password: string) {
    // Modo demo: cria sessão mock
    if (!supabase) {
      if (!name || !email || !password) return { error: 'Preencha todos os campos.' }
      const mockUser: User = { ...MOCK_OWNER, email, name, role: 'student' }
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return {}
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error?.message }
  }

  async function logout() {
    if (!supabase) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  async function refreshUser() {
    if (!supabase || !user) return
    const profile = await fetchProfile(user.id)
    if (profile) setUser(profile)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
