import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Progress } from '../../components/ui/Progress'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { useAuth } from '../../contexts/AuthContext'
import { useEnrolledCourses } from '../../hooks/useCourses'
import { useProgress } from '../../hooks/useProgress'
import { MOCK_MODULES } from '../../data/mock'

const ALL_LESSON_IDS = MOCK_MODULES.flatMap(m => m.lessons.map(l => l.id))

type Filter = 'all' | 'in_progress' | 'completed'

export function StudentMyCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courses, loading } = useEnrolledCourses(user?.id ?? '')
  const { getCourseProgress } = useProgress(user?.id ?? '')
  const [filter, setFilter] = useState<Filter>('all')

  const withProgress = courses.map(c => ({
    ...c,
    progress: getCourseProgress(ALL_LESSON_IDS),
  }))

  const filtered = withProgress.filter(c => {
    if (filter === 'completed') return c.progress >= 100
    if (filter === 'in_progress') return c.progress > 0 && c.progress < 100
    return true
  })

  const filterOptions: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'in_progress', label: 'Em andamento' },
    { key: 'completed', label: 'Concluídos' },
  ]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 1000 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 6px' }}>
              Meus Cursos
            </h1>
            <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
              {courses.length} curso{courses.length !== 1 ? 's' : ''} no seu histórico
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {filterOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                style={{
                  padding: '8px 18px', borderRadius: 100,
                  border: `1px solid ${filter === opt.key ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                  background: filter === opt.key ? 'rgba(225,6,0,0.1)' : 'transparent',
                  color: filter === opt.key ? '#E10600' : C.textMuted,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}

            <div style={{ marginLeft: 'auto' }}>
              <Button variant="outline" size="sm" onClick={() => navigate('/loja')}>
                <Icons.Shop size={14} /> Ver loja
              </Button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <SkeletonGrid cols={3} cards={6} />
          ) : filtered.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <h3 style={{ color: C.text, margin: '0 0 8px', fontSize: 18 }}>
                {filter === 'all' ? 'Você ainda não está matriculado em nenhum curso' : 'Nenhum curso nessa categoria'}
              </h3>
              <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 20px' }}>
                {filter === 'all' ? 'Explore nossa loja e comece a aprender hoje.' : 'Tente outro filtro.'}
              </p>
              {filter === 'all' && (
                <Button variant="primary" onClick={() => navigate('/loja')}>
                  Explorar cursos
                </Button>
              )}
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filtered.map((course, i) => {
                const isCompleted = course.progress >= 100
                return (
                  <FadeIn key={course.id} delay={i * 0.05}>
                    <Card hover style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => navigate(`/curso/${course.id}`)}>
                      {/* Thumbnail */}
                      <div style={{
                        height: 110, background: course.thumbnail_gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, position: 'relative',
                      }}>
                        {course.emoji}
                        {isCompleted && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(74,222,128,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Badge variant="success">✓ Concluído</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 3px', lineHeight: 1.3 }}>
                            {course.title}
                          </h3>
                          <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>{course.subtitle}</p>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: C.textMuted }}>Progresso</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isCompleted ? C.success : '#E10600' }}>
                              {course.progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={course.progress} color={isCompleted ? C.success : '#E10600'} />
                        </div>

                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textDim }}>
                          <span><Icons.Book size={12} /> {course.modules_count} módulos</span>
                          <span><Icons.Clock size={12} /> {course.hours}h</span>
                        </div>

                        <Button
                          variant={isCompleted ? 'outline' : 'primary'}
                          size="sm"
                          fullWidth
                          onClick={e => { e.stopPropagation(); navigate(`/curso/${course.id}`) }}
                        >
                          {isCompleted ? 'Revisar curso' : course.progress > 0 ? 'Continuar' : 'Começar'}
                        </Button>
                      </div>
                    </Card>
                  </FadeIn>
                )
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </PageLayout>
  )
}
