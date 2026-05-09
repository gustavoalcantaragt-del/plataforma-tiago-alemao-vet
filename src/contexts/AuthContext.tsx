// ─────────────────────────────────────────────
// AUTH CONTEXT — Supabase real
// ─────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

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
    if (!supabase) {
      setLoading(false)
      return
    }

    // Carrega sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        // Só atualiza se encontrou perfil — não força logout se falhar
        if (profile) setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, password: string) {
    if (!supabase) return { error: 'Supabase não configurado' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    // Aguarda o perfil ser carregado antes de retornar
    // para garantir que user != null quando navigate('/dashboard') for chamado
    if (data.user) {
      const profile = await fetchProfile(data.user.id)
      if (profile) setUser(profile)
    }
    return {}
  }

  async function signup(name: string, email: string, password: string) {
    if (!supabase) return { error: 'Supabase não configurado' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error?.message }
  }

  async function logout() {
    if (!supabase) return
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
