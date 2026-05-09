import { useState, useEffect } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageLayout } from '../../components/layout/PageLayout'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useEvents } from '../../hooks/useEvents'
import { useAllUserAccess } from '../../hooks/useUserAccess'
import type { Event, EventType } from '../../types'

const TYPE_CONFIG: Record<EventType, { icon: string; label: string; color: string }> = {
  live:     { icon: '📡', label: 'Live',    color: '#ef4444' },
  webinar:  { icon: '🎙️', label: 'Webinar', color: '#8b5cf6' },
  mentoria: { icon: '🎯', label: 'Mentoria', color: '#E10600' },
  qa:       { icon: '💬', label: 'Q&A',     color: '#06b6d4' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Event status helpers ────────────────────────────────────────────────────
type EventStatus = 'live' | 'soon' | 'recording' | null

function getEventStatus(ev: Event): EventStatus {
  const now = Date.now()
  const start = new Date(ev.scheduled_at).getTime()
  const end = start + ev.duration_min * 60_000
  if (now >= start && now < end) return 'live'
  if (start > now && start - now <= 24 * 3600_000) return 'soon'
  if (now >= end && ev.recording_url) return 'recording'
  return null
}

function StatusBadge({ status }: { status: EventStatus }) {
  if (!status) return null
  const cfg = {
    live:      { label: '🔴 AO VIVO',             bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    soon:      { label: '🟡 EM BREVE',             bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: 'rgba(245,158,11,0.4)' },
    recording: { label: '🎬 GRAVAÇÃO DISPONÍVEL',  bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.35)' },
  }[status]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
      padding: '3px 8px', borderRadius: 6,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Countdown component ─────────────────────────────────────────────────────
function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(new Date(target).getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(target).getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (diff <= 0) return <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>🔴 Ao vivo agora!</span>

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)

  const Box = ({ v, l }: { v: number; l: string }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 20, fontWeight: 800, color: '#E10600', lineHeight: 1,
        background: 'rgba(225,6,0,0.1)', borderRadius: 8,
        padding: '6px 10px', minWidth: 44,
      }}>
        {String(v).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{l}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
      {days > 0 && <Box v={days} l="dias" />}
      <Box v={hours} l="horas" />
      <Box v={mins} l="min" />
      {days === 0 && <Box v={secs} l="seg" />}
    </div>
  )
}

// ─── Mini calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ events }: { events: Event[] }) {
  const now = new Date()
  const [viewMonth, setViewMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Set of days that have events this month
  const eventDays = new Set(
    events
      .filter(e => {
        const d = new Date(e.scheduled_at)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(e => new Date(e.scheduled_at).getDate())
  )

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = viewMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function prevMonth() {
    setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <Card style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 16 }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, textTransform: 'capitalize' }}>{monthLabel}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 16 }}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['D','S','T','Q','Q','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: C.textDim, fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
          const hasEvent = day !== null && eventDays.has(day)
          return (
            <div key={i} style={{
              aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, position: 'relative', fontSize: 12,
              background: isToday ? 'rgba(225,6,0,0.2)' : 'transparent',
              color: day ? (isToday ? '#E10600' : C.text) : 'transparent',
              fontWeight: isToday ? 700 : 400,
            }}>
              {day}
              {hasEvent && (
                <span style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: '#E10600',
                }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: C.textDim, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E10600', display: 'inline-block' }} />
        Dia com evento
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function StudentMentorings() {
  const { events, loading } = useEvents()
  const { accessIds } = useAllUserAccess()
  const now = new Date()

  const upcoming = events.filter(e => new Date(e.scheduled_at) > now)
  const past = events.filter(e => new Date(e.scheduled_at) <= now)

  // Próximo evento com countdown
  const nextEvent = upcoming[0]

  function canAccess(event: Event) {
    return event.access_type === 'free' || accessIds.some(id => id === event.id)
  }

  if (loading) {
    return (
      <PageLayout>
        <SkeletonList rows={4} />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 1000 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 6px' }}>
              Mentorias & Lives
            </h1>
            <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
              {upcoming.length} evento{upcoming.length !== 1 ? 's' : ''} programado{upcoming.length !== 1 ? 's' : ''} ·{' '}
              {past.length} gravação{past.length !== 1 ? 'ões' : ''} disponíve{past.length !== 1 ? 'is' : 'l'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
            {/* Main content */}
            <div>
              {/* Próximo evento — destaque com countdown */}
              {nextEvent && (
                <FadeIn>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(225,6,0,0.08), rgba(225,6,0,0.03))',
                    border: `1px solid rgba(225,6,0,0.2)`,
                    borderRadius: 16, padding: 24, marginBottom: 28,
                  }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#E10600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Próximo evento
                      </span>
                      <Badge variant="primary" style={{ fontSize: 10 }}>
                        {TYPE_CONFIG[nextEvent.type].icon} {TYPE_CONFIG[nextEvent.type].label}
                      </Badge>
                      {nextEvent.access_type === 'free'
                        ? <Badge variant="success" style={{ fontSize: 10 }}>Grátis</Badge>
                        : <Badge variant="muted" style={{ fontSize: 10 }}>Premium</Badge>
                      }
                      <StatusBadge status={getEventStatus(nextEvent)} />
                    </div>
                    <h2 style={{ fontWeight: 700, fontSize: 22, color: C.text, margin: '0 0 6px' }}>
                      {nextEvent.title}
                    </h2>
                    <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 16px', lineHeight: 1.6 }}>
                      {nextEvent.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                      <Countdown target={nextEvent.scheduled_at} />
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: C.textDim }}>
                          📅 {formatDateShort(nextEvent.scheduled_at)} · ⏱ {nextEvent.duration_min} min
                          {nextEvent.registrations_count != null && ` · ${nextEvent.registrations_count} inscritos`}
                        </span>
                        {canAccess(nextEvent) && nextEvent.meet_url ? (
                          <Button variant="primary" size="sm"
                            onClick={() => window.open(nextEvent.meet_url, '_blank')}>
                            Participar →
                          </Button>
                        ) : canAccess(nextEvent) ? (
                          <Button variant="outline" size="sm">Link em breve</Button>
                        ) : (
                          <Button variant="outline" size="sm">🔒 Premium</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Próximos eventos */}
              {upcoming.length > 1 && (
                <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                    Agenda completa
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                    {upcoming.slice(1).map((ev, i) => {
                      const tc = TYPE_CONFIG[ev.type]
                      const accessible = canAccess(ev)
                      return (
                        <FadeIn key={ev.id} delay={i * 50}>
                          <Card style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{
                              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                              background: 'rgba(255,255,255,0.04)',
                              border: `1px solid ${C.borderSubtle}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                            }}>
                              {tc.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Badge variant="muted" style={{ fontSize: 10 }}>{tc.label}</Badge>
                                {ev.access_type === 'free'
                                  ? <Badge variant="success" style={{ fontSize: 10 }}>Grátis</Badge>
                                  : <Badge variant="primary" style={{ fontSize: 10 }}>Premium</Badge>
                                }
                                <StatusBadge status={getEventStatus(ev)} />
                              </div>
                              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>{ev.title}</h3>
                              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 8px', lineHeight: 1.5 }}>{ev.description}</p>
                              <div style={{ fontSize: 12, color: C.textDim }}>
                                📅 {formatDate(ev.scheduled_at)} · ⏱ {ev.duration_min} min
                                {ev.registrations_count != null && ` · ${ev.registrations_count} inscritos`}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              {accessible && ev.meet_url
                                ? <Button variant="primary" size="sm" onClick={() => window.open(ev.meet_url, '_blank')}>Participar</Button>
                                : accessible
                                ? <Button variant="outline" size="sm">Link em breve</Button>
                                : <Button variant="outline" size="sm">🔒 Premium</Button>
                              }
                            </div>
                          </Card>
                        </FadeIn>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Gravações */}
              {past.length > 0 && (
                <>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                    Gravações disponíveis
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {past.map((ev, i) => (
                      <FadeIn key={ev.id} delay={i * 40}>
                        <Card style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                            background: 'rgba(255,255,255,0.03)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                          }}>🎬</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{ev.title}</span>
                              <StatusBadge status={getEventStatus(ev)} />
                            </div>
                            <div style={{ fontSize: 12, color: C.textDim }}>
                              {formatDateShort(ev.scheduled_at)} · {ev.duration_min} min
                              {ev.registrations_count != null && ` · ${ev.registrations_count} participantes`}
                            </div>
                          </div>
                          {ev.recording_url
                            ? <Button variant="outline" size="sm"
                                onClick={() => window.open(ev.recording_url, '_blank')}>
                                ▶ Assistir
                              </Button>
                            : <span style={{ fontSize: 12, color: C.textDim }}>Em breve</span>
                          }
                        </Card>
                      </FadeIn>
                    ))}
                  </div>
                </>
              )}

              {upcoming.length === 0 && past.length === 0 && (
                <Card style={{ textAlign: 'center', padding: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                  <p style={{ color: C.textMuted }}>Nenhum evento disponível no momento.</p>
                </Card>
              )}
            </div>

            {/* Sidebar — calendário */}
            <div style={{ position: 'sticky', top: 20 }}>
              <MiniCalendar events={events} />

              {/* Stats */}
              <Card style={{ marginTop: 16, padding: '16px 20px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                  Resumo
                </h3>
                {[
                  { label: 'Próximos eventos', value: upcoming.length },
                  { label: 'Gravações', value: past.filter(e => e.recording_url).length },
                  { label: 'Gratuitos', value: events.filter(e => e.access_type === 'free').length },
                  { label: 'Premium', value: events.filter(e => e.access_type !== 'free').length },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: `1px solid ${C.borderSubtle}`,
                    fontSize: 13,
                  }}>
                    <span style={{ color: C.textMuted }}>{s.label}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </FadeIn>
    </PageLayout>
  )
}
