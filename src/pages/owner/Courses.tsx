import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { supabase } from '../../lib/supabase'
import { USE_MOCK_DATA } from '../../lib/features'
import { MOCK_COURSES, MOCK_MODULES } from '../../data/mock'
import type { Course, Module, Lesson } from '../../types'

// ─── Lesson Form ──────────────────────────────────────────────────────────────
interface LessonFormProps {
  lesson?: Partial<Lesson>
  onSave: (l: Partial<Lesson>) => void
  onCancel: () => void
}
function LessonForm({ lesson, onSave, onCancel }: LessonFormProps) {
  const [form, setForm] = useState<Partial<Lesson>>(lesson ?? { title: '', video_url: '', duration: '', is_preview: false })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ background: C.bgElevated, border: `1px solid ${C.borderSubtle}`, borderRadius: 10, padding: 14, marginTop: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input label="Título da aula" value={form.title} onChange={set('title')} placeholder="Ex: Introdução ao Marketing Digital" />
        <Input label="URL do vídeo (YouTube ou link direto)" value={form.video_url ?? ''} onChange={set('video_url')} placeholder="https://youtube.com/watch?v=..." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input label="Duração" value={form.duration ?? ''} onChange={set('duration')} placeholder="Ex: 12:30" />
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
              <input type="checkbox" checked={form.is_preview ?? false}
                onChange={e => setForm(p => ({ ...p, is_preview: e.target.checked }))} />
              Aula de prévia (gratuita)
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)}>
            <Icons.Check size={13} /> Salvar aula
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Module Section ───────────────────────────────────────────────────────────
interface ModuleSectionProps {
  module: Module & { lessons: Lesson[] }
  onUpdateModule: (title: string) => void
  onDeleteModule: () => void
  onAddLesson: (l: Partial<Lesson>) => void
  onUpdateLesson: (lessonId: string, l: Partial<Lesson>) => void
  onDeleteLesson: (lessonId: string) => void
}
function ModuleSection({ module, onUpdateModule, onDeleteModule, onAddLesson, onUpdateLesson, onDeleteLesson }: ModuleSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(module.title)
  const [addingLesson, setAddingLesson] = useState(false)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)

  return (
    <div style={{ border: `1px solid ${C.borderSubtle}`, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Module header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', background: C.bgElevated,
        borderBottom: expanded ? `1px solid ${C.borderSubtle}` : 'none',
      }}>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 0, fontSize: 12 }}>
          {expanded ? '▼' : '▶'}
        </button>
        {editingTitle ? (
          <input
            autoFocus
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={() => { onUpdateModule(titleVal); setEditingTitle(false) }}
            onKeyDown={e => e.key === 'Enter' && (onUpdateModule(titleVal), setEditingTitle(false))}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${'rgba(225,6,0,0.4)'}`, borderRadius: 6, padding: '4px 10px', color: C.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
        ) : (
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{module.title}</span>
        )}
        <span style={{ fontSize: 12, color: C.textDim }}>{module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setEditingTitle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4 }}>
          <Icons.Edit size={13} />
        </button>
        <button onClick={onDeleteModule} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, padding: 4, opacity: 0.7 }}>
          <Icons.X size={13} />
        </button>
      </div>

      {/* Lessons */}
      {expanded && (
        <div style={{ padding: '8px 16px 12px' }}>
          {module.lessons.map((lesson, idx) => (
            <div key={lesson.id}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: idx < module.lessons.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
              }}>
                <span style={{ fontSize: 11, color: C.textDim, width: 18, textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{lesson.title}</span>
                  <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                    {lesson.duration && <span style={{ fontSize: 11, color: C.textDim }}>⏱ {lesson.duration}</span>}
                    {lesson.video_url && <span style={{ fontSize: 11, color: C.textDim }}>🎬 Vídeo</span>}
                    {lesson.is_preview && <Badge variant="success" style={{ fontSize: 9, padding: '1px 6px' }}>Prévia</Badge>}
                  </div>
                </div>
                <button onClick={() => setEditingLesson(editingLesson === lesson.id ? null : lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4 }}>
                  <Icons.Edit size={13} />
                </button>
                <button onClick={() => onDeleteLesson(lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, padding: 4, opacity: 0.7 }}>
                  <Icons.X size={13} />
                </button>
              </div>
              {editingLesson === lesson.id && (
                <LessonForm
                  lesson={lesson}
                  onSave={l => { onUpdateLesson(lesson.id, l); setEditingLesson(null) }}
                  onCancel={() => setEditingLesson(null)}
                />
              )}
            </div>
          ))}

          {addingLesson ? (
            <LessonForm
              onSave={l => { onAddLesson(l); setAddingLesson(false) }}
              onCancel={() => setAddingLesson(false)}
            />
          ) : (
            <button
              onClick={() => setAddingLesson(true)}
              style={{
                width: '100%', marginTop: 8, padding: '8px 0',
                background: 'rgba(225,6,0,0.04)', border: `1px dashed rgba(225,6,0,0.25)`,
                borderRadius: 8, color: '#E10600', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,6,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(225,6,0,0.04)')}
            >
              + Adicionar aula
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Content Drawer ───────────────────────────────────────────────────────────
interface ContentDrawerProps {
  course: Course
  onClose: () => void
}
function ContentDrawer({ course, onClose }: ContentDrawerProps) {
  const initial = MOCK_MODULES.filter(m => m.course_id === course.id).map(m => ({ ...m, lessons: m.lessons ?? [] }))
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>(initial.length > 0 ? initial : [])
  const [addingModule, setAddingModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')

  async function addModule() {
    if (!newModuleTitle.trim()) return
    const m: Module & { lessons: Lesson[] } = {
      id: Date.now().toString(), course_id: course.id,
      title: newModuleTitle, order: modules.length, lessons: [],
    }
    setModules(prev => [...prev, m])
    setNewModuleTitle(''); setAddingModule(false)
    if (supabase) await supabase.from('modules').insert({ id: m.id, course_id: m.course_id, title: m.title, order: m.order })
  }

  async function updateModule(id: string, title: string) {
    setModules(prev => prev.map(m => m.id === id ? { ...m, title } : m))
    if (supabase) await supabase.from('modules').update({ title }).eq('id', id)
  }

  async function deleteModule(id: string) {
    setModules(prev => prev.filter(m => m.id !== id))
    if (supabase) await supabase.from('modules').delete().eq('id', id)
  }

  async function addLesson(moduleId: string, l: Partial<Lesson>) {
    const lesson: Lesson = {
      id: Date.now().toString(), module_id: moduleId,
      title: l.title ?? 'Nova aula', duration: l.duration ?? '',
      video_url: l.video_url ?? '', order: 0, is_preview: l.is_preview ?? false,
    }
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m))
    if (supabase) await supabase.from('lessons').insert(lesson)
  }

  async function updateLesson(moduleId: string, lessonId: string, l: Partial<Lesson>) {
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: m.lessons.map(ls => ls.id === lessonId ? { ...ls, ...l } : ls)
    } : m))
    if (supabase) await supabase.from('lessons').update(l).eq('id', lessonId)
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    setModules(prev => prev.map(m => m.id === moduleId ? {
      ...m, lessons: m.lessons.filter(ls => ls.id !== lessonId)
    } : m))
    if (supabase) await supabase.from('lessons').delete().eq('id', lessonId)
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 680,
        background: C.bgCard, borderLeft: `1px solid ${C.borderSubtle}`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.borderSubtle}`, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: course.thumbnail_gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {course.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: C.text, margin: '0 0 2px' }}>{course.title}</h2>
            <span style={{ fontSize: 12, color: C.textMuted }}>{modules.length} módulos · {totalLessons} aulas</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', padding: 4 }}>
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {modules.map(module => (
            <ModuleSection
              key={module.id}
              module={module}
              onUpdateModule={title => updateModule(module.id, title)}
              onDeleteModule={() => deleteModule(module.id)}
              onAddLesson={l => addLesson(module.id, l)}
              onUpdateLesson={(lessonId, l) => updateLesson(module.id, lessonId, l)}
              onDeleteLesson={lessonId => deleteLesson(module.id, lessonId)}
            />
          ))}

          {addingModule ? (
            <div style={{ border: `1px solid ${'rgba(225,6,0,0.4)'}`, borderRadius: 12, padding: 16, background: 'rgba(225,6,0,0.04)' }}>
              <Input
                label="Nome do módulo"
                value={newModuleTitle}
                onChange={e => setNewModuleTitle(e.target.value)}
                placeholder="Ex: Módulo 1 — Fundamentos"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <Button variant="ghost" size="sm" onClick={() => { setAddingModule(false); setNewModuleTitle('') }}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={addModule}><Icons.Check size={13} /> Criar módulo</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingModule(true)}
              style={{
                width: '100%', padding: '12px 0',
                background: 'rgba(225,6,0,0.04)', border: `1px dashed rgba(225,6,0,0.3)`,
                borderRadius: 12, color: '#E10600', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,6,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(225,6,0,0.04)')}
            >
              + Adicionar módulo
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.borderSubtle}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="primary" onClick={onClose}><Icons.Check size={14} /> Salvar estrutura</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Course Row ───────────────────────────────────────────────────────────────
function CourseRow({ course, onEdit, onToggle, onManage }: { course: Course; onEdit: () => void; onToggle: () => void; onManage: () => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 140px',
      alignItems: 'center', gap: 16,
      padding: '16px 20px',
      borderBottom: `1px solid ${C.borderSubtle}`,
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: course.thumbnail_gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{course.emoji}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{course.title}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{course.category}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center' }}>
        {course.modules_count}m / {course.lessons_count}a / {course.hours}h
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{course.students_count.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: C.textDim }}>alunos</div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#E10600' }}>R$ {course.price}</div>
        {course.price_old > 0 && <div style={{ fontSize: 11, color: C.textDim, textDecoration: 'line-through' }}>R$ {course.price_old}</div>}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Badge variant={course.is_published ? 'success' : 'muted'}>
          {course.is_published ? 'Publicado' : 'Rascunho'}
        </Badge>
      </div>

      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
        <Button variant="outline" size="sm" onClick={onManage} title="Gerenciar conteúdo">
          <Icons.Book size={12} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} icon={<Icons.Edit size={12} />} />
        <Button variant={course.is_published ? 'danger' : 'outline'} size="sm" onClick={onToggle}
          icon={course.is_published ? <Icons.EyeOff size={12} /> : <Icons.Eye size={12} />} />
      </div>
    </div>
  )
}

// ─── Course Modal ─────────────────────────────────────────────────────────────
type ModalMode = 'create' | 'edit'
function CourseModal({ course, mode, onClose, onSave }: { course?: Partial<Course>; mode: ModalMode; onClose: () => void; onSave: (c: Partial<Course>) => void }) {
  const [form, setForm] = useState<Partial<Course>>(course ?? { title: '', subtitle: '', category: 'Gestão Clínica', price: 197, price_old: 397, is_published: false })

  const field = (k: keyof Course) => ({
    value: String(form[k] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value })),
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.borderSubtle}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, margin: 0 }}>
            {mode === 'create' ? 'Novo curso' : 'Editar curso'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><Icons.X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Título do curso" {...field('title')} placeholder="Ex: Gestão Clínica Veterinária Avançada" />
          <Input label="Subtítulo" {...field('subtitle')} placeholder="Breve descrição do curso" />
          <Input label="Categoria" as="select" {...field('category')}>
            {['Gestão Clínica', 'Clínica Veterinária', 'Pet Shop', 'Financeiro', 'Marketing', 'Vendas', 'Carreira'].map(c => <option key={c}>{c}</option>)}
          </Input>
          <Input label="Emoji (thumbnail)" {...field('emoji')} placeholder="📚" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Preço (R$)" type="number" value={String(form.price ?? '')} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
            <Input label="Preço original (R$)" type="number" value={String(form.price_old ?? '')} onChange={e => setForm(p => ({ ...p, price_old: Number(e.target.value) }))} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
            <input type="checkbox" checked={form.is_published ?? false} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
            Publicar curso imediatamente
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="md" fullWidth onClick={() => onSave(form)} icon={<Icons.Check size={14} />}>
            {mode === 'create' ? 'Criar curso' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OwnerCourses() {
  const [courses, setCourses] = useState<Course[]>(USE_MOCK_DATA ? MOCK_COURSES : [])
  const [modal, setModal] = useState<{ mode: ModalMode; course?: Partial<Course> } | null>(null)
  const [managingCourse, setManagingCourse] = useState<Course | null>(null)

  function togglePublish(id: string) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, is_published: !c.is_published } : c))
  }

  function handleSave(form: Partial<Course>) {
    if (modal?.mode === 'create') {
      const newC: Course = {
        ...form as Course, id: Date.now().toString(),
        created_at: new Date().toISOString(), owner_id: 'owner',
        students_count: 0, rating: 0,
        modules_count: 0, lessons_count: 0, hours: 0,
        thumbnail_gradient: 'linear-gradient(135deg, #E10600, #C40000)',
        emoji: form.emoji ?? '📚', description: form.subtitle ?? '',
        price_old: form.price_old ?? 0,
      }
      setCourses(prev => [newC, ...prev])
    } else {
      setCourses(prev => prev.map(c => c.id === modal?.course?.id ? { ...c, ...form } : c))
    }
    setModal(null)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>Cursos</h1>
            <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
              {courses.filter(c => c.is_published).length} publicados · {courses.filter(c => !c.is_published).length} rascunhos
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setModal({ mode: 'create' })} icon={<Icons.Plus size={16} />}>
            Novo curso
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 140px', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${C.borderSubtle}` }}>
            {['Curso', 'Conteúdo', 'Alunos', 'Preço', 'Status', ''].map(h => (
              <div key={h} style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {courses.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: C.textMuted }}>
              Nenhum curso ainda. Clique em "Novo curso" para começar.
            </div>
          )}

          {courses.map(c => (
            <CourseRow
              key={c.id} course={c}
              onEdit={() => setModal({ mode: 'edit', course: c })}
              onToggle={() => togglePublish(c.id)}
              onManage={() => setManagingCourse(c)}
            />
          ))}
        </Card>
      </FadeIn>

      {modal && (
        <CourseModal mode={modal.mode} course={modal.course} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {managingCourse && (
        <ContentDrawer course={managingCourse} onClose={() => setManagingCourse(null)} />
      )}
    </PageLayout>
  )
}
