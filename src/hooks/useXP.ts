import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// ─── Level config ─────────────────────────────────────────────────────────────
export interface LevelConfig {
  level: number
  name: string
  icon: string
  xpRequired: number // XP total to reach this level
  color: string
}

export const LEVELS: LevelConfig[] = [
  { level: 1,  name: 'Iniciante',       icon: '🌱', xpRequired: 0,    color: '#6b7280' },
  { level: 2,  name: 'Aprendiz',        icon: '📖', xpRequired: 100,  color: '#10b981' },
  { level: 3,  name: 'Estudante',       icon: '🎓', xpRequired: 250,  color: '#3b82f6' },
  { level: 4,  name: 'Praticante',      icon: '⚡', xpRequired: 500,  color: '#8b5cf6' },
  { level: 5,  name: 'Comprometido',    icon: '🔥', xpRequired: 800,  color: '#f59e0b' },
  { level: 6,  name: 'Dedicado',        icon: '💪', xpRequired: 1200, color: '#ef4444' },
  { level: 7,  name: 'Especialista',    icon: '🏆', xpRequired: 1700, color: '#ec4899' },
  { level: 8,  name: 'Mestre',          icon: '💎', xpRequired: 2300, color: '#06b6d4' },
  { level: 9,  name: 'Elite VET',       icon: '👑', xpRequired: 3000, color: '#d4af37' },
  { level: 10, name: 'Lenda VET',       icon: '🌟', xpRequired: 4000, color: '#d4af37' },
]

export function getLevelFromXP(xp: number): LevelConfig {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl
    else break
  }
  return current
}

export function getNextLevel(xp: number): LevelConfig | null {
  const current = getLevelFromXP(xp)
  return LEVELS.find(l => l.level === current.level + 1) ?? null
}

export function getLevelProgress(xp: number): number {
  const current = getLevelFromXP(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  const range = next.xpRequired - current.xpRequired
  const earned = xp - current.xpRequired
  return Math.round((earned / range) * 100)
}

// ─── XP awards ────────────────────────────────────────────────────────────────
export const XP_AWARDS = {
  lesson_complete:  10,
  module_complete:  30,
  course_complete: 100,
  daily_login:       5,
  event_attended:   20,
  material_download: 2,
  community_post:   15,
  first_lesson:     50,  // achievement bonus
  first_course:    200,  // achievement bonus
  streak_7:        100,  // achievement bonus
  streak_30:       500,  // achievement bonus
}

// ─── Hook ────────────────────────────────────────────────────────────────────
interface XPState {
  totalXP: number
  level: LevelConfig
  nextLevel: LevelConfig | null
  progress: number   // 0-100 to next level
  streakDays: number
  lastLoginAt: string | null
}

// Demo XP so the UI isn't empty on first load
const DEMO_STATE: XPState = {
  totalXP: 320, level: LEVELS[2], nextLevel: LEVELS[3], progress: 28,
  streakDays: 5, lastLoginAt: new Date().toISOString(),
}

export function useXP() {
  const { user } = useAuth()
  const [state, setState] = useState<XPState>(DEMO_STATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    if (!supabase) {
      setState(DEMO_STATE)
      setLoading(false)
      return
    }
    supabase
      .from('user_xp')
      .select('total_xp, streak_days, last_login_at')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const xp = data.total_xp ?? 0
          setState({
            totalXP: xp,
            level: getLevelFromXP(xp),
            nextLevel: getNextLevel(xp),
            progress: getLevelProgress(xp),
            streakDays: data.streak_days ?? 0,
            lastLoginAt: data.last_login_at,
          })
        } else {
          setState(DEMO_STATE)
        }
        setLoading(false)
      })
  }, [user?.id])

  /** Award XP to the current user */
  const awardXP = useCallback(async (amount: number, reason?: string) => {
    if (!user) return
    setState(prev => {
      const newXP = prev.totalXP + amount
      return {
        ...prev,
        totalXP: newXP,
        level: getLevelFromXP(newXP),
        nextLevel: getNextLevel(newXP),
        progress: getLevelProgress(newXP),
      }
    })
    if (!supabase) return
    // Upsert XP increment
    await supabase.rpc('increment_user_xp', { p_user_id: user.id, p_amount: amount })
    if (reason) console.log(`[XP] +${amount} (${reason})`)
  }, [user?.id])

  /** Record daily login and update streak */
  const recordLogin = useCallback(async () => {
    if (!user || !supabase) return
    const today = new Date().toDateString()
    if (state.lastLoginAt && new Date(state.lastLoginAt).toDateString() === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = state.lastLoginAt
      && new Date(state.lastLoginAt).toDateString() === yesterday.toDateString()

    const newStreak = isConsecutive ? state.streakDays + 1 : 1
    setState(prev => ({ ...prev, streakDays: newStreak, lastLoginAt: new Date().toISOString() }))
    await supabase.from('user_xp').upsert({
      user_id: user.id,
      streak_days: newStreak,
      last_login_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    await awardXP(XP_AWARDS.daily_login, 'daily_login')
  }, [user?.id, state.streakDays, state.lastLoginAt, awardXP])

  return { ...state, loading, awardXP, recordLogin }
}
