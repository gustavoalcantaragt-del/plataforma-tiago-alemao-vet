import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { PageLayout } from '../../components/layout/PageLayout'
import { useXP, XP_AWARDS } from '../../hooks/useXP'
import { LevelCard, LevelsRoadmap } from '../../components/gamification/LevelBadge'

// ─── Achievement definitions ──────────────────────────────────────────────────
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  category: 'estudo' | 'streak' | 'comunidade' | 'especial'
  // Progress info
  current: number
  target: number
}

function buildAchievements(stats: {
  lessonsCompleted: number
  coursesCompleted: number
  streakDays: number
  postsCreated: number
  materialsDownloaded: number
  eventsAttended: number
  totalXP: number
}): Achievement[] {
  return [
    {
      id: 'first_lesson', title: 'Primeiro Passo', icon: '🌱',
      description: 'Conclua sua primeira aula',
      xpReward: XP_AWARDS.first_lesson, category: 'estudo',
      current: Math.min(stats.lessonsCompleted, 1), target: 1,
    },
    {
      id: 'lessons_10', title: 'Estudante Dedicado', icon: '📚',
      description: 'Conclua 10 aulas',
      xpReward: 80, category: 'estudo',
      current: Math.min(stats.lessonsCompleted, 10), target: 10,
    },
    {
      id: 'lessons_50', title: 'Maratonista', icon: '🏃',
      description: 'Conclua 50 aulas',
      xpReward: 300, category: 'estudo',
      current: Math.min(stats.lessonsCompleted, 50), target: 50,
    },
    {
      id: 'first_course', title: 'Formado', icon: '🎓',
      description: 'Conclua seu primeiro curso completo',
      xpReward: XP_AWARDS.first_course, category: 'estudo',
      current: Math.min(stats.coursesCompleted, 1), target: 1,
    },
    {
      id: 'courses_3', title: 'Multiespecialista', icon: '🏆',
      description: 'Conclua 3 cursos',
      xpReward: 500, category: 'estudo',
      current: Math.min(stats.coursesCompleted, 3), target: 3,
    },
    {
      id: 'streak_3', title: 'Sequência Iniciada', icon: '🔥',
      description: '3 dias seguidos de estudo',
      xpReward: 30, category: 'streak',
      current: Math.min(stats.streakDays, 3), target: 3,
    },
    {
      id: 'streak_7', title: 'Semana Perfeita', icon: '⚡',
      description: '7 dias seguidos de estudo',
      xpReward: XP_AWARDS.streak_7, category: 'streak',
      current: Math.min(stats.streakDays, 7), target: 7,
    },
    {
      id: 'streak_30', title: 'Mês Imparável', icon: '💎',
      description: '30 dias seguidos de estudo',
      xpReward: XP_AWARDS.streak_30, category: 'streak',
      current: Math.min(stats.streakDays, 30), target: 30,
    },
    {
      id: 'community_post', title: 'Membro Ativo', icon: '💬',
      description: 'Faça sua primeira publicação na comunidade',
      xpReward: 25, category: 'comunidade',
      current: Math.min(stats.postsCreated, 1), target: 1,
    },
    {
      id: 'community_5', title: 'Colaborador', icon: '🤝',
      description: 'Faça 5 publicações na comunidade',
      xpReward: 100, category: 'comunidade',
      current: Math.min(stats.postsCreated, 5), target: 5,
    },
    {
      id: 'download_5', title: 'Bibliófilo', icon: '📖',
      description: 'Baixe 5 materiais da biblioteca',
      xpReward: 50, category: 'especial',
      current: Math.min(stats.materialsDownloaded, 5), target: 5,
    },
    {
      id: 'event_1', title: 'Presença Garantida', icon: '📡',
      description: 'Participe de uma live ou mentoria',
      xpReward: 60, category: 'especial',
      current: Math.min(stats.eventsAttended, 1), target: 1,
    },
    {
      id: 'event_3', title: 'Participante Assíduo', icon: '🎙️',
      description: 'Participe de 3 lives ou mentorias',
      xpReward: XP_AWARDS.event_attended * 3 + 40, category: 'especial',
      current: Math.min(stats.eventsAttended, 3), target: 3,
    },
    {
      id: 'level_5', title: 'Avançando Forte', icon: '👑',
      description: 'Alcance o nível 5 — Comprometido',
      xpReward: 150, category: 'especial',
      current: stats.totalXP >= 800 ? 1 : 0, target: 1,
    },
  ]
}

const CATEGORY_CONFIG = {
  estudo:     { label: 'Estudo',     color: '#3b82f6' },
  streak:     { label: 'Sequência',  color: '#f59e0b' },
  comunidade: { label: 'Comunidade', color: '#10b981' },
  especial:   { label: 'Especial',   color: '#E10600' },
}

function AchievementCard({ a }: { a: Achievement }) {
  const unlocked = a.current >= a.target
  const progress = Math.round((a.current / a.target) * 100)
  const catColor = CATEGORY_CONFIG[a.category].color

  return (
    <Card style={{
      padding: '18px 20px',
      background: unlocked ? `${catColor}10` : C.bgCard,
      border: `1px solid ${unlocked ? `${catColor}30` : C.borderSubtle}`,
      opacity: unlocked ? 1 : 0.65,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: unlocked ? `${catColor}20` : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${unlocked ? `${catColor}40` : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          filter: unlocked ? 'none' : 'grayscale(1)',
        }}>
          {a.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: unlocked ? C.text : C.textMuted, marginBottom: 2 }}>
                {a.title}
                {unlocked && <span style={{ marginLeft: 6, fontSize: 11, color: catColor }}>✓ Desbloqueado</span>}
              </div>
              <div style={{ fontSize: 12, color: C.textDim }}>{a.description}</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: catColor, flexShrink: 0,
              background: `${catColor}15`, borderRadius: 6, padding: '2px 7px',
            }}>
              +{a.xpReward} XP
            </div>
          </div>

          {/* Progress bar */}
          {!unlocked && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: catColor, borderRadius: 2, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>
                {a.current} / {a.target}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export function StudentAchievements() {
  const { totalXP, level, streakDays } = useXP()

  // Demo stats (would come from Supabase in production)
  const stats = {
    lessonsCompleted: 12,
    coursesCompleted: 1,
    streakDays,
    postsCreated: 2,
    materialsDownloaded: 3,
    eventsAttended: 1,
    totalXP,
  }

  const achievements = buildAchievements(stats)
  const unlocked = achievements.filter(a => a.current >= a.target)
  const categories = Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 900 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 6px' }}>
              Conquistas
            </h1>
            <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
              {unlocked.length} de {achievements.length} conquistas desbloqueadas
            </p>
          </div>

          {/* Level card */}
          <div style={{ marginBottom: 24 }}>
            <LevelCard xp={totalXP} />
          </div>

          {/* Levels roadmap */}
          <Card style={{ marginBottom: 28, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              Trilha de níveis
            </div>
            <LevelsRoadmap currentXP={totalXP} />
          </Card>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'XP Total', value: totalXP.toLocaleString(), icon: '⚡' },
              { label: 'Streak atual', value: `${streakDays}d`, icon: '🔥' },
              { label: 'Desbloqueadas', value: `${unlocked.length}/${achievements.length}`, icon: '🏆' },
              { label: 'Nível atual', value: `${level.icon} ${level.name}`, icon: '👑' },
            ].map(s => (
              <Card key={s.label} style={{ padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#E10600' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Achievements by category */}
          {categories.map(cat => {
            const items = achievements.filter(a => a.category === cat)
            const catUnlocked = items.filter(a => a.current >= a.target).length
            const catConf = CATEGORY_CONFIG[cat]
            return (
              <div key={cat} style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
                    {catConf.label}
                  </h2>
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: `${catConf.color}20`,
                    color: catConf.color, borderRadius: 6, padding: '2px 8px',
                  }}>
                    {catUnlocked}/{items.length}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {items.map((a, i) => (
                    <FadeIn key={a.id} delay={i * 50}>
                      <AchievementCard a={a} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </FadeIn>
    </PageLayout>
  )
}
