import { useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Progress } from '../../components/ui/Progress'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useEnrolledCourses } from '../../hooks/useCourses'
import { useProgress } from '../../hooks/useProgress'
import { MOCK_MODULES } from '../../data/mock'
import type { Course } from '../../types'

// ─── Onboarding Steps ─────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    emoji: '👋',
    title: 'Bem-vindo à Plataforma!',
    desc: 'Você está na plataforma de educação veterinária do Tiago Alemão. Aqui você vai encontrar tudo que precisa para alavancar sua carreira e seu negócio.',
    action: null,
  },
  {
    emoji: '📚',
    title: 'Seus Cursos',
    desc: 'Em "Meus Cursos" você acessa todos os cursos em que está matriculado. Assista no seu ritmo, pause e continue quando quiser.',
    action: { label: 'Ver meus cursos', to: '/meus-cursos' },
  },
  {
    emoji: '🗺️',
    title: 'Trilha de Aprendizado',
    desc: 'A Trilha guia você por uma jornada estruturada de crescimento profissional — do básico ao avançado, na ordem certa.',
    action: { label: 'Ver minha trilha', to: '/trilha' },
  },
  {
    emoji: '🏆',
    title: 'Conquistas & XP',
    desc: 'Ganhe pontos de experiência (XP) a cada aula concluída, suba de nível e desbloqueie conquistas exclusivas da comunidade VET.',
    action: { label: 'Ver conquistas', to: '/conquistas' },
  },
  {
    emoji: '💬',
    title: 'Comunidade',
    desc: 'Na Comunidade você troca experiências com outros veterinários e gestores do Brasil inteiro. Tire dúvidas, compartilhe conquistas e cresça junto.',
    action: { label: 'Conhecer a comunidade', to: '/comunidade' },
  },
]

function OnboardingModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const current = ONBOARDING_STEPS[step]
  const isLast = step === ONBOARDING_STEPS.length - 1

  function handleAction() {
    if (current.action) {
      onClose()
      navigate(current.action.to)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 16,
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
        padding: 36, maxWidth: 460, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i === step ? '#E10600' : i < step ? `rgba(225,6,0,0.4)` : C.surfaceHover,
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Emoji */}
        <div style={{ textAlign: 'center', fontSize: 52, marginBottom: 16 }}>
          {current.emoji}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: C.text,
          textAlign: 'center', margin: '0 0 12px',
        }}>
          {step === 0 ? `${current.title.replace('!', '')}, ${name.split(' ')[0]}!` : current.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 14, color: C.textMuted, textAlign: 'center',
          lineHeight: 1.7, margin: '0 0 28px',
        }}>
          {current.desc}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.action && (
            <Button variant="outline" size="sm" fullWidth onClick={handleAction}>
              {current.action.label} →
            </Button>
          )}
          {isLast ? (
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              Começar agora 🚀
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep(s => s + 1)}>
              Próximo →
            </Button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: C.textDim, fontSize: 12,
            cursor: 'pointer', padding: '4px 0',
          }}>
            Pular introdução
          </button>
        </div>
      </div>
    </div>
  )
}

const ALL_LESSON_IDS = MOCK_MODULES.flatMap(m => m.lessons.map(l => l.id))

function StatCard({ icon, label, value, color = '#E10600' }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `rgba(225,6,0,0.1)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{value}</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>{label}</div>
      </div>
    </Card>
  )
}

interface LastLesson {
  courseId: string
  lessonId: string
  lessonTitle: string
  moduleTitle: string
  courseEmoji: string
  courseTitle: string
  courseThumbnailGradient: string
}

function ContinueCard({ last, onContinue }: { last: LastLesson; onContinue: () => void }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(225,6,0,0.12), rgba(225,6,0,0.04))',
      border: '1.5px solid rgba(225,6,0,0.35)',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      flexWrap: 'wrap', marginBottom: 32, cursor: 'pointer',
    }} onClick={onContinue}>
      <div style={{
        width: 60, height: 60, borderRadius: 14, flexShrink: 0,
        background: last.courseThumbnailGradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>
        {last.courseEmoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: '#E10600', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Continue de onde parou
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {last.lessonTitle}
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>
          {last.courseTitle} · {last.moduleTitle}
        </div>
      </div>
      <Button variant="primary" size="sm" icon={<Icons.Play size={14} />} onClick={e => { e.stopPropagation(); onContinue() }}>
        Continuar
      </Button>
    </div>
  )
}

function CourseCard({ course, progress, onContinue }: { course: Course; progress: number; onContinue: () => void }) {
  return (
    <Card hover style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        height: 100, borderRadius: 8,
        background: course.thumbnail_gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        {course.emoji}
      </div>
      <div>
        <Badge variant="muted" style={{ marginBottom: 8 }}>{course.category}</Badge>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: '0 0 4px' }}>
          {course.title}
        </h3>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
          {course.modules_count} módulos · {course.lessons_count} aulas
        </p>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
          <span>Progresso</span>
          <span style={{ color: '#E10600', fontWeight: 600 }}>{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
      <Button variant="primary" size="sm" fullWidth onClick={onContinue} icon={<Icons.Play size={14} />}>
        {progress > 0 ? 'Continuar' : 'Começar'}
      </Button>
    </Card>
  )
}

export function StudentHome() {
  const { user } = useAuth()
  const { courses } = useEnrolledCourses(user?.id ?? '')
  const { getCourseProgress } = useProgress(user?.id ?? '')
  const navigate = useNavigate()

  // ─── Onboarding: show once per user ────────────────────────────────────────
  const onboardingKey = `nl_onboarded_${user?.id}`
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!user?.id) return false
    return !localStorage.getItem(onboardingKey)
  })
  function closeOnboarding() {
    localStorage.setItem(onboardingKey, '1')
    setShowOnboarding(false)
  }

  const lastLesson = useMemo<LastLesson | null>(() => {
    if (!user?.id) return null
    const saved = localStorage.getItem(`nl_last_lesson_${user.id}`)
    try { return saved ? JSON.parse(saved) : null } catch { return null }
  }, [user?.id])

  const completedLessons = ALL_LESSON_IDS.filter(id => {
    const saved = localStorage.getItem(`nl_progress_${user?.id}`)
    const p = saved ? JSON.parse(saved) : {}
    return !!p[id]
  }).length

  const stats = [
    { icon: <Icons.Book size={22} />, label: 'Cursos matriculados', value: courses.length },
    { icon: <Icons.Check size={22} />, label: 'Aulas concluídas', value: completedLessons },
    { icon: <Icons.Clock size={22} />, label: 'Horas de estudo', value: Math.floor(completedLessons * 0.35) + 'h' },
    { icon: <Icons.Medal size={22} />, label: 'Certificados', value: 1 },
  ]

  const inProgress = courses.filter(c => {
    const ids = MOCK_MODULES.filter(m => m.course_id === c.id).flatMap(m => m.lessons.map(l => l.id))
    const p = getCourseProgress(ids)
    return p > 0 && p < 100
  })

  const completed = courses.filter(c => {
    const ids = MOCK_MODULES.filter(m => m.course_id === c.id).flatMap(m => m.lessons.map(l => l.id))
    return getCourseProgress(ids) === 100
  })

  return (
    <PageLayout>
      {/* Onboarding modal */}
      {showOnboarding && user && (
        <OnboardingModal name={user.name} onClose={closeOnboarding} />
      )}

      {/* Hero */}
      <FadeIn>
        <div style={{
          background: 'linear-gradient(135deg, rgba(225,6,0,0.08), rgba(225,6,0,0.02))',
          border: `1px solid rgba(225,6,0,0.4)`, borderRadius: 16,
          padding: 32, marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 14, color: '#E10600', margin: '0 0 8px', fontWeight: 500 }}>
              Bem-vindo de volta 👋
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              {user?.name?.split(' ')[0]}, continue de onde parou!
            </h1>
            <p style={{ color: C.textMuted, margin: 0, fontSize: 15 }}>
              Você tem {inProgress.length} curso{inProgress.length !== 1 ? 's' : ''} em andamento.
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/loja')} icon={<Icons.Zap size={16} />}>
            Ver mais cursos
          </Button>
        </div>
      </FadeIn>

      {/* Continue de onde parou */}
      {lastLesson && (
        <FadeIn delay={50}>
          <ContinueCard
            last={lastLesson}
            onContinue={() => navigate(`/curso/${lastLesson.courseId}`)}
          />
        </FadeIn>
      )}

      {/* Stats */}
      <FadeIn delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </FadeIn>

      {/* Em andamento */}
      {inProgress.length > 0 && (
        <FadeIn delay={200}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 16 }}>
            Continuar assistindo
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
            {inProgress.map(c => {
              const ids = MOCK_MODULES.filter(m => m.course_id === c.id).flatMap(m => m.lessons.map(l => l.id))
              return (
                <CourseCard
                  key={c.id} course={c}
                  progress={getCourseProgress(ids)}
                  onContinue={() => navigate(`/curso/${c.id}`)}
                />
              )
            })}
          </div>
        </FadeIn>
      )}

      {/* Concluídos */}
      {completed.length > 0 && (
        <FadeIn delay={300}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 16 }}>
            Cursos concluídos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {completed.map(c => {
              const ids = MOCK_MODULES.filter(m => m.course_id === c.id).flatMap(m => m.lessons.map(l => l.id))
              return (
                <Card key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                    background: c.thumbnail_gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </div>
                    <Progress value={getCourseProgress(ids)} height={3} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/certificados')} icon={<Icons.Medal size={14} />}>
                    Cert.
                  </Button>
                </Card>
              )
            })}
          </div>
        </FadeIn>
      )}

      {/* Sem cursos */}
      {courses.length === 0 && (
        <FadeIn delay={200}>
          <div style={{
            textAlign: 'center', padding: '80px 32px',
            color: C.textMuted,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 20, color: C.text, marginBottom: 8 }}>Nenhum curso ainda</h3>
            <p style={{ marginBottom: 24 }}>Explore nossa loja e comece sua jornada.</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/loja')}>
              Ver cursos disponíveis
            </Button>
          </div>
        </FadeIn>
      )}
    </PageLayout>
  )
}
