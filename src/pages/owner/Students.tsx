import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { Icons } from '../../components/icons'
import { Avatar } from '../../components/ui/Avatar'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { PageLayout } from '../../components/layout/PageLayout'
import { MOCK_STUDENT_METRICS } from '../../data/mock'
import type { StudentMetrics } from '../../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '../../lib/supabase'
import { USE_MOCK_DATA } from '../../lib/features'

type ActivityFilter = 'all' | 'active7d' | 'inactive_7_30' | 'inactive_30plus'

function getActivityFilter(lastAccess: string): ActivityFilter {
  const daysAgo = (Date.now() - new Date(lastAccess).getTime()) / 86400_000
  if (daysAgo <= 7) return 'active7d'
  if (daysAgo <= 30) return 'inactive_7_30'
  return 'inactive_30plus'
}

// ─── VET segment mock ────────────────────────────────────────────────────────
const VET_SEGMENT_DATA = [
  { role: 'Médico Vet. Clínico', count: 312, avg_progress: 72, color: '#3B82F6' },
  { role: 'Prop. Pet Shop',      count: 198, avg_progress: 65, color: '#F59E0B' },
  { role: 'Gestor de Clínica',   count: 167, avg_progress: 80, color: '#10B981' },
  { role: 'Residente/Estag.',    count: 134, avg_progress: 58, color: '#8B5CF6' },
  { role: 'Outros',              count: 100, avg_progress: 50, color: '#6B7280' },
]

const STATUS_LABELS: Record<StudentMetrics['status'], { label: string; variant: 'success' | 'danger' | 'primary' }> = {
  active:    { label: 'Ativo', variant: 'success' },
  risk:      { label: 'Em risco', variant: 'danger' },
  completed: { label: 'Concluído', variant: 'primary' },
}

export function OwnerStudents() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StudentMetrics['status'] | 'all'>('all')
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all')
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'access'>('access')
  const [revokeTarget, setRevokeTarget] = useState<StudentMetrics | null>(null)
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set())

  const students = USE_MOCK_DATA ? MOCK_STUDENT_METRICS : []

  const filtered = students
    .filter(s => !revokedIds.has(s.user_id))
    .filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchActivity = activityFilter === 'all' || getActivityFilter(s.last_access) === activityFilter
      return matchSearch && matchStatus && matchActivity
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'progress') return b.avg_progress - a.avg_progress
      return new Date(b.last_access).getTime() - new Date(a.last_access).getTime()
    })

  async function handleRevoke() {
    if (!revokeTarget) return
    if (supabase) {
      try {
        await supabase.from('enrollments').delete().eq('user_id', revokeTarget.user_id)
      } catch (err) { console.error('[revoke]', err) }
    }
    setRevokedIds(prev => new Set(prev).add(revokeTarget.user_id))
  }

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    risk: students.filter(s => s.status === 'risk').length,
    completed: students.filter(s => s.status === 'completed').length,
  }

  return (
    <PageLayout>
      <ConfirmModal
        open={!!revokeTarget}
        title="Revogar acesso"
        message={revokeTarget ? `Tem certeza que deseja revogar o acesso de ${revokeTarget.name}? Ele perderá matrícula em todos os cursos.` : ''}
        confirmLabel="Revogar acesso"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
      <FadeIn>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>Alunos</h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>Acompanhe o engajamento e progresso dos seus alunos.</p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: stats.total, color: C.text },
            { label: 'Ativos', value: stats.active, color: C.success },
            { label: 'Em risco', value: stats.risk, color: C.danger },
            { label: 'Concluíram', value: stats.completed, color: '#E10600' },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={120}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Icons.Search size={14} color={C.textMuted}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
                borderRadius: 8, color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'active', 'risk', 'completed'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit',
                border: `1px solid ${statusFilter === s ? C.borderActive : C.borderSubtle}`,
                background: statusFilter === s ? 'rgba(225,6,0,0.1)' : 'transparent',
                color: statusFilter === s ? '#E10600' : C.textMuted, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'risk' ? 'Em risco' : 'Concluídos'}
              </button>
            ))}
          </div>

          {/* Activity filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              { key: 'all', label: 'Toda atividade' },
              { key: 'active7d', label: '🟢 Ativos 7d' },
              { key: 'inactive_7_30', label: '🟡 Inativos 7-30d' },
              { key: 'inactive_30plus', label: '🔴 Inativos 30d+' },
            ] as const).map(f => (
              <button key={f.key} onClick={() => setActivityFilter(f.key)} style={{
                padding: '8px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit',
                border: `1px solid ${activityFilter === f.key ? C.borderActive : C.borderSubtle}`,
                background: activityFilter === f.key ? 'rgba(225,6,0,0.1)' : 'transparent',
                color: activityFilter === f.key ? '#E10600' : C.textMuted, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{
            padding: '8px 12px', background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
            borderRadius: 8, color: C.textMuted, fontSize: 12, fontFamily: 'inherit', outline: 'none',
          }}>
            <option value="access">Último acesso</option>
            <option value="progress">Progresso</option>
            <option value="name">Nome</option>
          </select>
        </div>
      </FadeIn>

      {/* Table */}
      <FadeIn delay={160}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 80px',
            gap: 16, padding: '12px 20px',
            borderBottom: `1px solid ${C.borderSubtle}`,
          }}>
            {['Aluno', 'Cursos', 'Progresso', 'Último acesso', 'Status', 'Ações'].map(h => (
              <div key={h} style={{ fontSize: 11, color: C.textDim, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {h}
              </div>
            ))}
          </div>

          {filtered.map(s => {
            const st = STATUS_LABELS[s.status]
            const daysInactive = Math.floor((Date.now() - new Date(s.last_access).getTime()) / 86400_000)
            return (
              <div key={s.user_id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 80px',
                alignItems: 'center', gap: 16, padding: '14px 20px',
                borderBottom: `1px solid ${C.borderSubtle}`,
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={s.name} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim }}>{s.email}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: 14, color: C.textMuted }}>
                  {s.courses_enrolled} curso{s.courses_enrolled !== 1 ? 's' : ''}
                </div>

                <div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4, textAlign: 'right' }}>{s.avg_progress}%</div>
                  <Progress value={s.avg_progress}
                    color={s.avg_progress >= 80 ? C.success : s.avg_progress >= 40 ? '#E10600' : C.danger} />
                </div>

                <div style={{ fontSize: 12, color: daysInactive >= 30 ? C.danger : daysInactive >= 7 ? '#f59e0b' : C.textDim }}>
                  {daysInactive === 0 ? 'Hoje' : daysInactive === 1 ? 'Ontem' : `${daysInactive}d atrás`}
                </div>

                <div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>

                <div>
                  <button
                    onClick={() => setRevokeTarget(s)}
                    title="Revogar acesso"
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'inherit',
                      border: `1px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.06)',
                      color: C.danger, cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Revogar
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>
              Nenhum aluno encontrado.
            </div>
          )}
        </Card>
      </FadeIn>

      {/* VET Segment Report */}
      <FadeIn delay={180}>
        <Card style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>
            Relatório por Perfil Profissional VET
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            {/* Bar chart */}
            <div>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 12px' }}>Alunos por segmento</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={VET_SEGMENT_DATA} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="role" tick={{ fill: C.textDim, fontSize: 11 }}
                    axisLine={false} tickLine={false} width={110} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => active && payload?.length ? (
                      <div style={{ background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#E10600' }}>
                        {payload[0].value} alunos
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {VET_SEGMENT_DATA.map(seg => (
                      <Cell key={seg.role} fill={seg.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress per segment */}
            <div>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 12px' }}>Progresso médio por perfil</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {VET_SEGMENT_DATA.map(seg => (
                  <div key={seg.role}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: C.text }}>{seg.role}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: seg.color }}>{seg.avg_progress}%</span>
                    </div>
                    <Progress value={seg.avg_progress} color={seg.color} height={5} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insight box */}
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: `${'#E10600'}0A`, border: `1px solid ${'#E10600'}33`, borderRadius: 8,
          }}>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
              💡 <strong style={{ color: '#E10600' }}>Insight:</strong> Gestores de clínica têm o maior progresso médio (80%).
              Residentes e estagiários têm o menor engajamento — considere conteúdo de boas-vindas específico para este perfil.
            </p>
          </div>
        </Card>
      </FadeIn>

      {/* Export */}
      <FadeIn delay={200}>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" icon={<Icons.Download size={14} />}
            onClick={() => {
              const csv = ['Nome,Email,Cursos,Progresso,Último Acesso,Status',
                ...students.map(s =>
                  `"${s.name}","${s.email}",${s.courses_enrolled},${s.avg_progress}%,${s.last_access},${s.status}`
                )].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'alunos.csv'; a.click()
              URL.revokeObjectURL(url)
            }}>
            Exportar CSV
          </Button>
        </div>
      </FadeIn>
    </PageLayout>
  )
}
