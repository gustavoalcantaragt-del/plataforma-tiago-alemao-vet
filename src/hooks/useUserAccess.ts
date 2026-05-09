import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { USE_MOCK_DATA } from '../lib/features'
import { MOCK_COURSES } from '../data/mock'

export function useUserAccess(productId: string) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user || !productId) {
        setHasAccess(false)
        setLoading(false)
        return
      }
      if (!supabase) {
        // Modo demo: libera acesso a todos os produtos
        setHasAccess(USE_MOCK_DATA)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data } = await supabase
          .from('user_access')
          .select('id, expires_at')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle()

        const expired = data?.expires_at ? new Date(data.expires_at) < new Date() : false
        setHasAccess(!!data && !expired)
      } catch {
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id, productId])

  return { hasAccess, loading }
}

export function useAllUserAccess() {
  const { user } = useAuth()
  const [accessIds, setAccessIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user) {
        setAccessIds([])
        setLoading(false)
        return
      }
      if (!supabase) {
        // Modo demo: todos os cursos acessíveis
        setAccessIds(USE_MOCK_DATA ? MOCK_COURSES.map(c => c.id) : [])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const { data } = await supabase
          .from('user_access')
          .select('product_id, expires_at')
          .eq('user_id', user.id)

        const now = new Date()
        const valid = (data ?? [])
          .filter(access => !access.expires_at || new Date(access.expires_at) > now)
          .map(access => access.product_id)
        setAccessIds(valid)
      } catch {
        setAccessIds([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.id])

  return { accessIds, loading }
}

export async function grantAccess(
  userId: string,
  productId: string,
  productType: string,
  expiresAt?: string,
) {
  if (!supabase) return { error: 'Supabase não configurado' }
  const { error } = await supabase.from('user_access').upsert({
    user_id: userId,
    product_id: productId,
    product_type: productType,
    source: 'admin_grant',
    granted_at: new Date().toISOString(),
    expires_at: expiresAt ?? null,
  }, { onConflict: 'user_id,product_id' })
  return { error: error?.message }
}

export async function revokeAccess(userId: string, productId: string) {
  if (!supabase) return { error: 'Supabase não configurado' }
  const { error } = await supabase
    .from('user_access')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  return { error: error?.message }
}
