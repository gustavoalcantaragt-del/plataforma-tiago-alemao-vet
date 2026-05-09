import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { C } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { Badge } from '../../components/ui/Badge'
import { Icons } from '../../components/icons'
import { Avatar } from '../../components/ui/Avatar'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useCourse } from '../../hooks/useCourses'
import { useProgress } from '../../hooks/useProgress'
import { useUserAccess } from '../../hooks/useUserAccess'
import { MOCK_MODULES } from '../../data/mock'
import { supabase } from '../../lib/supabase'
import { useXP, XP_AWARDS } from '../../hooks/useXP'
import type { Lesson, Module } from '../../types'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const
type Speed = typeof SPEED_OPTIONS[number]

type Tab = 'info' | 'notas' | 'discussao'

const MOCK_COMMENTS = [
  { id: '1', user: { name: 'Carlos Mendes' }, content: 'Aula incrível! Finalmente entendi a diferença entre público frio e quente.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', user: { name: 'Fernanda Lima' }, content: 'Alguém pode me ajudar? Meu pixel não está disparando corretamente no checkout.', created_at: new Date(Date.now() - 7200000).toISOString() },
]

export function CoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { course, loading } = useCourse(courseId ?? '')
  const { hasAccess, loading: accessLoading } = useUserAccess(courseId ?? '')
  const { markComplete, isCompleted, getCourseProgress } = useProgress(user?.id ?? '')
  const { awardXP } = useXP()
  const canAccessCourse = !!course && (
    course.price <= 0 || hasAccess || user?.role === 'owner' || user?.role === 'admin'
  )

  const modules = MOCK_MODULES.filter(m => m.course_id === courseId)
  const allLessons = modules.flatMap(m => m.lessons)

  const [activeModule, setActiveModule] = useState(0)
  const [activeLesson, setActiveLesson] = useState(0)
  const [tab, setTab] = useState<Tab>('info')
  const [notes, setNotes] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [played, setPlayed] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [speed, setSpeed] = useState<Speed>(1)
  const [autoplay, setAutoplay] = useState(true)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [xpToast, setXpToast] = useState<string | null>(null)
  const noteSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const xpToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentLesson: Lesson | undefined = modules[activeModule]?.lessons[activeLesson]
  const progress = getCourseProgress(allLessons.map(l => l.id))

  // Persiste última aula acessada para o dashboard "Continue de onde parou"
  useEffect(() => {
    if (!user?.id || !currentLesson || !courseId || !course) return
    const mod = modules[activeModule]
    localStorage.setItem(`nl_last_lesson_${user.id}`, JSON.stringify({
      courseId,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      moduleTitle: mod?.title ?? '',
      courseEmoji: course.emoji,
      courseTitle: course.title,
      courseThumbnailGradient: course.thumbnail_gradient,
    }))
  }, [currentLesson?.id, user?.id])

  useEffect(() => {
    if (!currentLesson || !user || !supabase) { setNotes(''); return }
    setNoteSaved(false)
    supabase
      .from('notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('lesson_id', currentLesson.id)
      .maybeSingle()
      .then(({ data }) => setNotes(data?.content ?? ''))
  }, [currentLesson?.id, user?.id])

  async function saveNote() {
    if (!currentLesson || !user || !supabase) return
    setNoteSaving(true)
    await supabase.from('notes').upsert({
      user_id: user.id,
      lesson_id: currentLesson.id,
      content: notes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    setNoteSaving(false)
    setNoteSaved(true)
    if (noteSavedTimer.current) clearTimeout(noteSavedTimer.current)
    noteSavedTimer.current = setTimeout(() => setNoteSaved(false), 3000)
  }

  function showXPToast(msg: string) {
    setXpToast(msg)
    if (xpToastTimer.current) clearTimeout(xpToastTimer.current)
    xpToastTimer.current = setTimeout(() => setXpToast(null), 2500)
  }

  const handleProgress = useCallback(({ played: p }: { played: number }) => {
    setPlayed(Math.round(p * 100))
    if (p > 0.9 && currentLesson && !isCompleted(currentLesson.id)) {
      markComplete(currentLesson.id)
      awardXP(XP_AWARDS.lesson_complete, 'lesson_complete')
      showXPToast(`+${XP_AWARDS.lesson_complete} XP`)
    }
  }, [currentLesson, markComplete, isCompleted, awardXP])

  function handleVideoEnded() {
    if (currentLesson) {
      markComplete(currentLesson.id)
      if (!isCompleted(currentLesson.id)) {
        awardXP(XP_AWARDS.lesson_complete, 'lesson_complete')
        showXPToast(`+${XP_AWARDS.lesson_complete} XP`)
      }
    }
    if (autoplay) {
      setTimeout(goNext, 1500)
    }
  }

  function goNext() {
    const mod = modules[activeModule]
    if (activeLesson < (mod?.lessons.length ?? 0) - 1) {
      setActiveLesson(l => l + 1)
    } else if (activeModule < modules.length - 1) {
      setActiveModule(m => m + 1)
      setActiveLesson(0)
    }
    setPlayed(0)
  }

  function goPrev() {
    if (activeLesson > 0) {
      setActiveLesson(l => l - 1)
    } else if (activeModule > 0) {
      setActiveModule(m => m - 1)
      setActiveLesson((modules[activeModule - 1]?.lessons.length ?? 1) - 1)
    }
    setPlayed(0)
  }

  if (loading || accessLoading || !course) return (
    <PageLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: C.textMuted }}>
        Carregando...
      </div>
    </PageLayout>
  )

  if (!canAccessCourse) return (
    <PageLayout>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 420, gap: 16, textAlign: 'center', color: C.textMuted,
      }}>
        <Icons.Lock size={40} color={C.textDim} />
        <div>
          <h1 style={{ margin: '0 0 8px', color: C.text, fontSize: 22 }}>Acesso não liberado</h1>
          <p style={{ margin: 0, fontSize: 14 }}>
            Este curso precisa ser adquirido antes de assistir às aulas.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/loja')}>
          Ver cursos
        </Button>
      </div>
    </PageLayout>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      {/* Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 68,
        background: C.bgCard, borderRight: `1px solid ${C.borderSubtle}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', zIndex: 100,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: C.textMuted,
          cursor: 'pointer', padding: 12,
        }}>
          <Icons.ArrowLeft size={20} />
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 68, marginRight: 340, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: `1px solid ${C.borderSubtle}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {course.title}
            </h1>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '2px 0 0' }}>
              {currentLesson?.title}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: '#E10600', fontWeight: 600 }}>{progress}%</span>
            <Progress value={progress} style={{ width: 100 }} />
          </div>
        </div>

        {/* Player */}
        <div style={{ background: '#000', aspectRatio: '16/9', position: 'relative' }}>
          {currentLesson?.video_url ? (
            <ReactPlayer
              url={currentLesson.video_url}
              width="100%" height="100%"
              controls
              playbackRate={speed}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              config={{ youtube: { playerVars: { modestbranding: 1 } } }}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: C.textMuted, gap: 16,
            }}>
              <Icons.Play size={56} color="rgba(255,255,255,0.2)" />
              <p style={{ fontSize: 14, margin: 0 }}>
                {isCompleted(currentLesson?.id ?? '') ? '✓ Aula concluída' : 'Conteúdo em breve'}
              </p>
              {!isCompleted(currentLesson?.id ?? '') && (
                <Button variant="primary" size="sm" onClick={() => currentLesson && markComplete(currentLesson.id)}>
                  Marcar como concluída
                </Button>
              )}
            </div>
          )}

          {/* Progress bar overlay */}
          {currentLesson?.video_url && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 }}>
              <div style={{ height: '100%', width: `${played}%`, background: '#E10600', transition: 'width 0.5s' }} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          padding: '10px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: `1px solid ${C.borderSubtle}`,
          gap: 8, flexWrap: 'wrap',
        }}>
          <Button variant="ghost" size="sm" onClick={goPrev} icon={<Icons.SkipBack size={14} />}>
            Anterior
          </Button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Speed selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSpeedMenu(s => !s)}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.borderSubtle}`,
                  background: speed !== 1 ? 'rgba(225,6,0,0.1)' : 'transparent',
                  color: speed !== 1 ? '#E10600' : C.textMuted,
                  cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 600,
                }}>
                {speed}×
              </button>
              {showSpeedMenu && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: C.bgCard, border: `1px solid ${C.borderSubtle}`, borderRadius: 8,
                  padding: 4, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 1,
                }}>
                  {SPEED_OPTIONS.map(s => (
                    <button key={s} onClick={() => { setSpeed(s); setShowSpeedMenu(false) }} style={{
                      padding: '6px 16px', borderRadius: 6, border: 'none',
                      background: s === speed ? 'rgba(225,6,0,0.1)' : 'transparent',
                      color: s === speed ? '#E10600' : C.textMuted,
                      cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                      fontWeight: s === speed ? 700 : 400,
                    }}>
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Autoplay toggle */}
            <button
              onClick={() => setAutoplay(a => !a)}
              title={autoplay ? 'Autoplay ativado' : 'Autoplay desativado'}
              style={{
                padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.borderSubtle}`,
                background: autoplay ? 'rgba(225,6,0,0.1)' : 'transparent',
                color: autoplay ? '#E10600' : C.textMuted,
                cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <Icons.Play size={10} />
              Auto
            </button>

            {/* Mark complete */}
            {isCompleted(currentLesson?.id ?? '') ? (
              <Badge variant="success"><Icons.Check size={12} /> Concluída</Badge>
            ) : (
              <Button variant="outline" size="sm"
                onClick={() => {
                  if (currentLesson) {
                    markComplete(currentLesson.id)
                    awardXP(XP_AWARDS.lesson_complete, 'lesson_complete')
                    showXPToast(`+${XP_AWARDS.lesson_complete} XP`)
                  }
                }}
                icon={<Icons.Check size={14} />}>
                Marcar concluída
              </Button>
            )}
          </div>

          <Button variant="primary" size="sm" onClick={goNext} icon={<Icons.SkipForward size={14} />}>
            Próxima
          </Button>
        </div>

        {/* XP toast */}
        {xpToast && (
          <div style={{
            position: 'fixed', bottom: 32, right: 360,
            background: '#E10600', color: '#fff',
            padding: '10px 20px', borderRadius: 10,
            fontSize: 14, fontWeight: 800,
            boxShadow: '0 4px 20px rgba(225,6,0,0.3)',
            zIndex: 9999, animation: 'fadeInUp 0.3s ease',
          }}>
            ⚡ {xpToast}
          </div>
        )}

        {/* Tabs */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.borderSubtle}`, padding: '0 24px' }}>
            {(['info', 'notas', 'discussao'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 16px', fontSize: 14, fontFamily: 'inherit',
                color: tab === t ? '#E10600' : C.textMuted,
                borderBottom: `2px solid ${tab === t ? '#E10600' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.2s',
              }}>
                {t === 'info' ? 'Conteúdo' : t === 'notas' ? 'Anotações' : 'Discussão'}
              </button>
            ))}
          </div>

          <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
            {tab === 'info' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 12 }}>
                  {currentLesson?.title}
                </h2>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icons.Clock size={14} /> {currentLesson?.duration}
                  </span>
                  <Badge variant={isCompleted(currentLesson?.id ?? '') ? 'success' : 'muted'}>
                    {isCompleted(currentLesson?.id ?? '') ? 'Concluída' : 'Pendente'}
                  </Badge>
                </div>
                <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7 }}>
                  Nesta aula você aprenderá os conceitos fundamentais para dominar esta habilidade.
                  Acompanhe com atenção e pratique os exercícios propostos para fixar o conteúdo.
                </p>
              </div>
            )}

            {tab === 'notas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: 16, color: C.text, margin: 0 }}>Suas anotações</h3>
                <textarea
                  value={notes}
                  onChange={e => { setNotes(e.target.value); setNoteSaved(false) }}
                  placeholder="Escreva suas anotações desta aula..."
                  rows={10}
                  style={{
                    background: C.bgElevated, border: `1px solid ${C.borderSubtle}`,
                    borderRadius: 10, padding: 14, color: C.text,
                    fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                    outline: 'none', lineHeight: 1.7,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-end' }}>
                  {noteSaved && (
                    <span style={{ fontSize: 12, color: C.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icons.Check size={12} /> Salvo
                    </span>
                  )}
                  <Button variant="primary" size="sm" loading={noteSaving}
                    onClick={saveNote} icon={<Icons.Check size={14} />}>
                    Salvar
                  </Button>
                </div>
              </div>
            )}

            {tab === 'discussao' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Avatar name={user?.name ?? 'U'} size={36} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Faça uma pergunta ou compartilhe algo..."
                      rows={3}
                      style={{
                        width: '100%', background: C.bgElevated,
                        border: `1px solid ${C.borderSubtle}`, borderRadius: 10,
                        padding: 12, color: C.text, fontSize: 14,
                        fontFamily: 'inherit', resize: 'none', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <Button variant="primary" size="sm" onClick={() => setNewComment('')}
                        icon={<Icons.Chat size={14} />}>
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>

                {MOCK_COMMENTS.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                    <Avatar name={c.user.name} size={36} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{c.user.name}</span>
                        <span style={{ fontSize: 12, color: C.textDim }}>
                          {new Date(c.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Module sidebar */}
      <aside style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 340,
        background: C.bgCard, borderLeft: `1px solid ${C.borderSubtle}`,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.borderSubtle}`, flexShrink: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0 }}>Conteúdo do curso</h2>
          <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
            {allLessons.filter(l => isCompleted(l.id)).length} / {allLessons.length} aulas concluídas
          </p>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {modules.map((mod: Module, mi: number) => (
            <div key={mod.id}>
              <div style={{
                padding: '12px 20px', fontSize: 12, fontWeight: 700,
                color: C.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase',
                background: C.bgElevated, borderBottom: `1px solid ${C.borderSubtle}`,
              }}>
                Módulo {mi + 1} — {mod.title}
              </div>
              {mod.lessons.map((lesson, li) => {
                const isActive = mi === activeModule && li === activeLesson
                const done = isCompleted(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => { setActiveModule(mi); setActiveLesson(li); setPlayed(0) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 20px', background: isActive ? 'rgba(225,6,0,0.08)' : 'transparent',
                      border: 'none', borderBottom: `1px solid ${C.borderSubtle}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                      borderLeft: isActive ? `3px solid ${'#E10600'}` : '3px solid transparent',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${done ? C.success : isActive ? '#E10600' : C.borderSubtle}`,
                      background: done ? C.success : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: done ? '#fff' : isActive ? '#E10600' : C.textDim,
                    }}>
                      {done ? <Icons.Check size={12} /> : <Icons.Play size={10} color="currentColor" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, color: isActive ? '#E10600' : done ? C.text : C.textMuted,
                        fontWeight: isActive ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{lesson.duration}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
