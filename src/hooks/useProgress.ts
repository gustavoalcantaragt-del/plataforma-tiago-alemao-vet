import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProgress(userId: string) {
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  // Carrega do Supabase primeiro; fallback para localStorage
  useEffect(() => {
    async function load() {
      if (!userId) { setLoading(false); return }
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', userId)
            .eq('completed', true)
          if (error) throw error
          if (data && data.length > 0) {
            const map: Record<string, boolean> = {}
            data.forEach((row: { lesson_id: string; completed: boolean }) => {
              map[row.lesson_id] = row.completed
            })
            setProgress(map)
            // Sincroniza cache local
            localStorage.setItem(`nl_progress_${userId}`, JSON.stringify(map))
            return
          }
        }
        // Fallback: localStorage
        const saved = localStorage.getItem(`nl_progress_${userId}`)
        try { setProgress(saved ? JSON.parse(saved) : {}) } catch { setProgress({}) }
      } catch (err) {
        console.error('[useProgress]', err)
        const saved = localStorage.getItem(`nl_progress_${userId}`)
        try { setProgress(saved ? JSON.parse(saved) : {}) } catch { setProgress({}) }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const markComplete = useCallback(async (lessonId: string) => {
    const updated = { ...progress, [lessonId]: true }
    setProgress(updated)
    localStorage.setItem(`nl_progress_${userId}`, JSON.stringify(updated))
    if (supabase) {
      try {
        await supabase.from('lesson_progress').upsert({
          user_id: userId, lesson_id: lessonId,
          completed: true, completed_at: new Date().toISOString(),
        })
      } catch (err) {
        console.error('[useProgress.markComplete]', err)
      }
    }
  }, [progress, userId])

  const isCompleted = useCallback((lessonId: string) => !!progress[lessonId], [progress])

  const getCourseProgress = useCallback((lessonIds: string[]) => {
    if (!lessonIds.length) return 0
    const done = lessonIds.filter(id => progress[id]).length
    return Math.round((done / lessonIds.length) * 100)
  }, [progress])

  return { progress, loading, markComplete, isCompleted, getCourseProgress }
}
