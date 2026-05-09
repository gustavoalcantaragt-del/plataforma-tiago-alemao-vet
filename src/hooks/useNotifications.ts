import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export type NotificationType = 'achievement' | 'course' | 'event' | 'payment' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  action_url?: string
  created_at: string
}


export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user) { setLoading(false); return }
    if (!supabase) { setLoading(false); return }

    // Initial load
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setNotifications((data as Notification[]) ?? [])
        setLoading(false)
      })

    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase!.removeChannel(channel) }
  }, [user?.id])

  const markRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (supabase) await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    if (supabase && user) {
      await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }, [user?.id])

  /** Insere notificação local (e no Supabase se disponível) */
  const push = useCallback(async (notif: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => {
    if (!user) return
    const newNotif: Notification = {
      ...notif, id: Math.random().toString(36).slice(2),
      user_id: user.id, is_read: false,
      created_at: new Date().toISOString(),
    }
    setNotifications(prev => [newNotif, ...prev])
    if (supabase) await supabase.from('notifications').insert(newNotif)
  }, [user?.id])

  return { notifications, unreadCount, loading, markRead, markAllRead, push }
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return 'agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}
