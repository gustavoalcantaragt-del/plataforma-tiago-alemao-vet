import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { USE_MOCK_DATA } from '../lib/features'
import type { LibraryItem } from '../types'

const MOCK_ITEMS: LibraryItem[] = [
  {
    id: '1', title: 'Guia de Precificação para Clínicas Veterinárias', type: 'ebook',
    description: 'Aprenda a calcular o preço justo para consultas, cirurgias e internações.',
    category: 'Gestão', access_type: 'free', file_url: '', download_count: 234,
    is_published: true, created_at: new Date().toISOString(),
  },
  {
    id: '2', title: 'Planilha de Controle Financeiro VET', type: 'spreadsheet',
    description: 'Planilha completa para controle de receitas, despesas e fluxo de caixa.',
    category: 'Financeiro', access_type: 'free', file_url: '', download_count: 187,
    is_published: true, created_at: new Date().toISOString(),
  },
  {
    id: '3', title: 'Checklist de Abertura de Clínica', type: 'pdf',
    description: 'Passo a passo completo com todos os documentos e requisitos necessários.',
    category: 'Gestão', access_type: 'free', file_url: '', download_count: 312,
    is_published: true, created_at: new Date().toISOString(),
  },
  {
    id: '4', title: 'Manual de Protocolos Clínicos', type: 'pdf',
    description: 'Protocolos atualizados para as principais especialidades veterinárias.',
    category: 'Clínica', access_type: 'subscription', file_url: '', download_count: 98,
    is_published: true, created_at: new Date().toISOString(),
  },
  {
    id: '5', title: 'Ebook: Marketing Digital para Veterinários', type: 'ebook',
    description: 'Como atrair e fidelizar clientes usando Instagram, Google e indicações.',
    category: 'Marketing', access_type: 'subscription', file_url: '', download_count: 145,
    is_published: true, created_at: new Date().toISOString(),
  },
  {
    id: '6', title: 'Roteiro de Vendas para Pet Shop', type: 'pdf',
    description: 'Scripts e técnicas de vendas adaptados ao atendimento em pet shops.',
    category: 'Vendas', access_type: 'subscription', file_url: '', download_count: 76,
    is_published: true, created_at: new Date().toISOString(),
  },
]

export function useLibraryItems() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (supabase) {
        const { data, error: dbError } = await supabase
          .from('library_items')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
        if (dbError) throw dbError
        if (data && data.length > 0) { setItems(data as LibraryItem[]); return }
      }
      setItems(USE_MOCK_DATA ? MOCK_ITEMS : [])
    } catch (err) {
      console.error('[useLibraryItems]', err)
      setError('Não foi possível carregar a biblioteca.')
      setItems(USE_MOCK_DATA ? MOCK_ITEMS : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { items, loading, error, reload: load }
}

export function useLibraryAdmin() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (supabase) {
        const { data, error: dbError } = await supabase
          .from('library_items')
          .select('*')
          .order('created_at', { ascending: false })
        if (dbError) throw dbError
        if (data && data.length > 0) { setItems(data as LibraryItem[]); return }
      }
      setItems(USE_MOCK_DATA ? MOCK_ITEMS : [])
    } catch (err) {
      console.error('[useLibraryAdmin]', err)
      setError('Não foi possível carregar os materiais.')
      setItems(USE_MOCK_DATA ? MOCK_ITEMS : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveItem(item: Partial<LibraryItem>, id?: string) {
    if (supabase) {
      if (id) {
        await supabase.from('library_items').update(item).eq('id', id)
      } else {
        const { data } = await supabase.from('library_items').insert({
          ...item, download_count: 0, created_at: new Date().toISOString(),
        }).select().single()
        return data as LibraryItem
      }
    }
    return null
  }

  async function deleteItem(id: string) {
    if (supabase) await supabase.from('library_items').delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  async function trackDownload(id: string) {
    setItems(p => p.map(x => x.id === id ? { ...x, download_count: x.download_count + 1 } : x))
    if (supabase) {
      await supabase.rpc('increment_download_count', { item_id: id })
    }
  }

  return { items, setItems, loading, error, reload: load, saveItem, deleteItem, trackDownload }
}
