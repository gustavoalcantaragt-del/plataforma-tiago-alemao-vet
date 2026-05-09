import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { USE_MOCK_DATA } from '../lib/features'
import type { Event } from '../types'

const MOCK_EVENTS: Event[] = [
  {
    id: '1', type: 'live', title: 'Gestão Financeira para Clínicas VET',
    description: 'Como estruturar seu fluxo de caixa, reduzir custos e escalar o faturamento da sua clínica.',
    scheduled_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    duration_min: 90, access_type: 'free', meet_url: '',
    recording_url: '', is_published: true, registrations_count: 156,
    created_at: new Date().toISOString(),
  },
  {
    id: '2', type: 'webinar', title: 'Marketing Digital para Veterinários',
    description: 'Instagram, anúncios pagos e posicionamento de autoridade para clínicas e profissionais VET.',
    scheduled_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    duration_min: 60, access_type: 'subscription', meet_url: '',
    recording_url: '', is_published: true, registrations_count: 89,
    created_at: new Date().toISOString(),
  },
  {
    id: '3', type: 'mentoria', title: 'Mentoria em Grupo — Gestão de Pet Shop',
    description: 'Sessão exclusiva para donos de pet shop: precificação, equipe e expansão.',
    scheduled_at: new Date(Date.now() + 17 * 86400000).toISOString(),
    duration_min: 120, access_type: 'subscription', meet_url: '',
    recording_url: '', is_published: true, registrations_count: 34,
    created_at: new Date().toISOString(),
  },
  {
    id: '4', type: 'qa', title: 'Tira-dúvidas ao Vivo com o Tiago',
    description: 'Sessão de perguntas e respostas sobre gestão, clínica e carreira veterinária.',
    scheduled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    duration_min: 60, access_type: 'free', meet_url: '',
    recording_url: '', is_published: true, registrations_count: 210,
    created_at: new Date().toISOString(),
  },
  {
    id: '5', type: 'live', title: 'Como Montar Seu Protocolo de Precificação',
    description: 'Aula especial com planilha ao vivo para calcular o preço ideal dos seus serviços.',
    scheduled_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    duration_min: 75, access_type: 'free', meet_url: '',
    recording_url: '', is_published: true, registrations_count: 302,
    created_at: new Date().toISOString(),
  },
]

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (supabase) {
        const { data, error: dbError } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .order('scheduled_at', { ascending: true })
        if (dbError) throw dbError
        if (data && data.length > 0) { setEvents(data as Event[]); return }
      }
      setEvents(USE_MOCK_DATA ? MOCK_EVENTS : [])
    } catch (err) {
      console.error('[useEvents]', err)
      setError('Não foi possível carregar os eventos.')
      setEvents(USE_MOCK_DATA ? MOCK_EVENTS : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { events, loading, error, reload: load }
}

export function useEventsAdmin() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (supabase) {
        const { data, error: dbError } = await supabase
          .from('events')
          .select('*')
          .order('scheduled_at', { ascending: true })
        if (dbError) throw dbError
        if (data && data.length > 0) { setEvents(data as Event[]); return }
      }
      setEvents(USE_MOCK_DATA ? MOCK_EVENTS : [])
    } catch (err) {
      console.error('[useEventsAdmin]', err)
      setError('Não foi possível carregar os eventos.')
      setEvents(USE_MOCK_DATA ? MOCK_EVENTS : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveEvent(event: Partial<Event>, id?: string): Promise<Event | null> {
    if (supabase) {
      if (id) {
        await supabase.from('events').update(event).eq('id', id)
        return null
      } else {
        const { data } = await supabase.from('events').insert({
          ...event, registrations_count: 0, created_at: new Date().toISOString(),
        }).select().single()
        return data as Event
      }
    }
    return null
  }

  async function deleteEvent(id: string) {
    if (supabase) await supabase.from('events').delete().eq('id', id)
    setEvents(p => p.filter(x => x.id !== id))
  }

  return { events, setEvents, loading, error, reload: load, saveEvent, deleteEvent }
}
