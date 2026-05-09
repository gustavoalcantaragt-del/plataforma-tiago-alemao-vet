import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useEventsAdmin } from '../../hooks/useEvents'
import type { Event, EventType } from '../../types'

const TYPE_CONFIG: Record<EventType, { icon: string; label: string }> = {
  live:     { icon: '📡', label: 'Live' },
  webinar:  { icon: '🎙️', label: 'Webinar' },
  mentoria: { icon: '🎯', label: 'Mentoria' },
  qa:       { icon: '💬', label: 'Q&A' },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface FormProps {
  initial?: Partial<Event>
  onSave: (data: Partial<Event>) => void
  onClose: () => void
}

function EventForm({ initial, onSave, onClose }: FormProps) {
  const isEdit = !!initial?.id

  // Convert ISO to datetime-local format
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  const [form, setForm] = useState<Partial<Event>>({
    title: '', description: '', type: 'live',
    duration_min: 60, access_type: 'free', meet_url: '',
    recording_url: '', is_published: true,
    ...initial,
    scheduled_at: toLocal(initial?.scheduled_at),
  })

  const set = (k: keyof Event, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit() {
    if (!form.title || !form.scheduled_at) return
    // Convert datetime-local to ISO
    const isoDate = new Date(form.scheduled_at!).toISOString()
    onSave({ ...form, scheduled_at: isoDate })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: C.bgCard, borderRadius: 16, border: `1px solid ${C.borderSubtle}`,
        width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, margin: 0 }}>
            {isEdit ? 'Editar evento' : 'Novo evento'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Título do evento" value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Ex: Live — Gestão Financeira para Clínicas VET" />

          <Input as="textarea" label="Descrição" rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Descreva o conteúdo que será abordado..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Tipo" as="select" value={form.type}
              onChange={e => set('type', e.target.value)}>
              {Object.entries(TYPE_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.icon} {c.label}</option>
              ))}
            </Input>
            <Input label="Acesso" as="select" value={form.access_type}
              onChange={e => set('access_type', e.target.value)}>
              <option value="free">Gratuito</option>
              <option value="subscription">Assinantes</option>
            </Input>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
            <Input label="Data e hora" type="datetime-local"
              value={form.scheduled_at as string}
              onChange={e => set('scheduled_at', e.target.value)} />
            <Input label="Duração (min)" type="number"
              value={String(form.duration_min ?? 60)}
              onChange={e => set('duration_min', parseInt(e.target.value) || 60)} />
          </div>

          <Input label="Link da sala (Zoom, Meet, YouTube Live...)"
            value={form.meet_url ?? ''}
            onChange={e => set('meet_url', e.target.value)}
            placeholder="https://meet.google.com/..." />

          {isEdit && (
            <Input label="URL da gravação (após o evento)"
              value={form.recording_url ?? ''}
              onChange={e => set('recording_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..." />
          )}

          {/* Published toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={() => set('is_published', !form.is_published)} style={{
              width: 40, height: 22, borderRadius: 11,
              background: form.is_published ? '#E10600' : C.borderSubtle,
              border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 3,
                left: form.is_published ? 20 : 4,
                width: 16, height: 16, borderRadius: '50%',
                background: form.is_published ? '#000' : C.textDim, transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {form.is_published ? 'Publicado para os alunos' : 'Rascunho (não visível)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={handleSubmit}>
              {isEdit ? 'Salvar alterações' : 'Criar evento'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Recording URL quick-edit ─────────────────────────────────────────────────
function RecordingModal({ event, onSave, onClose }: {
  event: Event
  onSave: (url: string) => void
  onClose: () => void
}) {
  const [url, setUrl] = useState(event.recording_url ?? '')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: C.bgCard, borderRadius: 16, border: `1px solid ${C.borderSubtle}`,
        width: '100%', maxWidth: 480, padding: 28,
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: C.text, margin: '0 0 16px' }}>
          Adicionar gravação
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 16px' }}>
          Cole a URL do YouTube, Vimeo ou outro serviço de vídeo.
        </p>
        <Input label="URL da gravação" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..." />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onSave(url)}>Salvar URL</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function OwnerMentorings() {
  const { events, setEvents, loading, saveEvent, deleteEvent } = useEventsAdmin()
  const [modal, setModal] = useState<null | 'new' | Event>(null)
  const [confirmDelete, setConfirmDelete] = useState<Event | null>(null)
  const [recordingModal, setRecordingModal] = useState<Event | null>(null)
  const [tabView, setTabView] = useState<'upcoming' | 'past'>('upcoming')

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.scheduled_at) > now)
  const past = events.filter(e => new Date(e.scheduled_at) <= now)
  const displayed = tabView === 'upcoming' ? upcoming : past

  async function handleSave(data: Partial<Event>) {
    if (!data.title || !data.scheduled_at) return
    if (modal === 'new') {
      const newEvent: Event = {
        id: Math.random().toString(36).slice(2),
        title: data.title!, description: data.description ?? '',
        type: data.type ?? 'live', scheduled_at: data.scheduled_at!,
        duration_min: data.duration_min ?? 60,
        access_type: data.access_type ?? 'free',
        meet_url: data.meet_url ?? '',
        recording_url: data.recording_url ?? '',
        is_published: data.is_published ?? true,
        registrations_count: 0,
        created_at: new Date().toISOString(),
      }
      setEvents(p => [...p, newEvent].sort((a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ))
      await saveEvent(data)
    } else {
      const updated = { ...(modal as Event), ...data }
      setEvents(p => p.map(x => x.id === updated.id ? updated : x))
      await saveEvent(data, updated.id)
    }
    setModal(null)
  }

  async function handleRecordingSave(url: string) {
    if (!recordingModal) return
    const updated = { ...recordingModal, recording_url: url }
    setEvents(p => p.map(x => x.id === updated.id ? updated : x))
    await saveEvent({ recording_url: url }, recordingModal.id)
    setRecordingModal(null)
  }

  async function togglePublished(event: Event) {
    const updated = { ...event, is_published: !event.is_published }
    setEvents(p => p.map(x => x.id === event.id ? updated : x))
    await saveEvent({ is_published: updated.is_published }, event.id)
  }

  const totalRegistrations = events.reduce((s, e) => s + (e.registrations_count ?? 0), 0)

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 960 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>
                Mentorias & Lives
              </h1>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                {events.length} evento{events.length !== 1 ? 's' : ''} · {totalRegistrations} inscrições totais
              </p>
            </div>
            <Button variant="primary" onClick={() => setModal('new')} icon={<Icons.Plus size={14} />}>
              Novo evento
            </Button>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Próximos eventos', value: upcoming.length, icon: '📅' },
              { label: 'Gravações', value: past.filter(e => e.recording_url).length, icon: '🎬' },
              { label: 'Inscrições totais', value: totalRegistrations, icon: '👥' },
              { label: 'Gratuitos', value: events.filter(e => e.access_type === 'free').length, icon: '🆓' },
            ].map(k => (
              <Card key={k.label} style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{k.value}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Tab filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['upcoming', 'past'] as const).map(t => (
              <button key={t} onClick={() => setTabView(t)} style={{
                padding: '7px 18px', borderRadius: 9999, fontSize: 13, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${tabView === t ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                background: tabView === t ? 'rgba(225,6,0,0.12)' : 'transparent',
                color: tabView === t ? '#E10600' : C.textMuted,
                fontWeight: tabView === t ? 600 : 400,
              }}>
                {t === 'upcoming' ? `Próximos (${upcoming.length})` : `Passados (${past.length})`}
              </button>
            ))}
          </div>

          {/* Events list */}
          {loading ? (
            <SkeletonList rows={4} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayed.map((ev, i) => {
                const tc = TYPE_CONFIG[ev.type]
                const isPast = new Date(ev.scheduled_at) <= now
                return (
                  <FadeIn key={ev.id} delay={i * 40}>
                    <Card style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      {/* Icon */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(225,6,0,0.06)',
                        border: `1px solid ${C.borderSubtle}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>
                        {tc.icon}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Badge variant="primary" style={{ fontSize: 10 }}>{tc.label}</Badge>
                          <Badge variant={ev.access_type === 'free' ? 'success' : 'muted'} style={{ fontSize: 10 }}>
                            {ev.access_type === 'free' ? 'Grátis' : 'Premium'}
                          </Badge>
                          {!ev.is_published && (
                            <Badge variant="muted" style={{ fontSize: 10 }}>Rascunho</Badge>
                          )}
                          {isPast && ev.recording_url && (
                            <Badge variant="success" style={{ fontSize: 10 }}>🎬 Com gravação</Badge>
                          )}
                          {isPast && !ev.recording_url && (
                            <Badge variant="muted" style={{ fontSize: 10 }}>Sem gravação</Badge>
                          )}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>
                          📅 {fmtDate(ev.scheduled_at)} · ⏱ {ev.duration_min} min
                          {ev.registrations_count != null && (
                            <span> · 👥 {ev.registrations_count} inscritos</span>
                          )}
                        </div>
                        {ev.meet_url && (
                          <div style={{ fontSize: 11, color: C.textMuted }}>🔗 {ev.meet_url}</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isPast && (
                          <Button variant="outline" size="sm"
                            onClick={() => setRecordingModal(ev)}
                            icon={<Icons.Play size={12} />}>
                            {ev.recording_url ? 'Editar gravação' : 'Adicionar gravação'}
                          </Button>
                        )}
                        <button onClick={() => togglePublished(ev)} title={ev.is_published ? 'Despublicar' : 'Publicar'}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: ev.is_published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${ev.is_published ? 'rgba(74,222,128,0.2)' : C.borderSubtle}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          {ev.is_published ? '👁' : '🙈'}
                        </button>
                        <Button variant="outline" size="sm" onClick={() => setModal(ev)}
                          icon={<Icons.Edit size={12} />}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" style={{ color: C.danger }}
                          onClick={() => setConfirmDelete(ev)}
                          icon={<Icons.Trash size={12} />}>
                          Remover
                        </Button>
                      </div>
                    </Card>
                  </FadeIn>
                )
              })}
            </div>
          )}

          {!loading && displayed.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>
                {tabView === 'upcoming' ? '📅' : '🎬'}
              </div>
              <p style={{ color: C.textMuted }}>
                {tabView === 'upcoming'
                  ? 'Nenhum evento programado. Clique em "Novo evento" para criar.'
                  : 'Nenhum evento passado ainda.'}
              </p>
            </Card>
          )}
        </div>
      </FadeIn>

      {modal !== null && (
        <EventForm
          initial={modal === 'new' ? undefined : (modal as Event)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {recordingModal && (
        <RecordingModal
          event={recordingModal}
          onSave={handleRecordingSave}
          onClose={() => setRecordingModal(null)}
        />
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Remover evento"
        message={`Deseja remover "${confirmDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={() => { if (confirmDelete) deleteEvent(confirmDelete.id) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageLayout>
  )
}
