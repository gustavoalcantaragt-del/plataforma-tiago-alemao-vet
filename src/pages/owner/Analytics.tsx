import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PageLayout } from '../../components/layout/PageLayout'
import { Progress } from '../../components/ui/Progress'
import { Avatar } from '../../components/ui/Avatar'
import {
  AreaChart, Area, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Mock analytics data ───────────────────────────────────────────────────────
const ENGAGEMENT_DAILY = [
  { day: 'Seg', sessions: 142, new_users: 12, completions: 28 },
  { day: 'Ter', sessions: 168, new_users: 18, completions: 35 },
  { day: 'Qua', sessions: 134, new_users: 9,  completions: 22 },
  { day: 'Qui', sessions: 195, new_users: 24, completions: 44 },
  { day: 'Sex', sessions: 221, new_users: 31, completions: 51 },
  { day: 'Sáb', sessions: 178, new_users: 16, completions: 38 },
  { day: 'Dom', sessions: 99,  new_users: 7,  completions: 18 },
]

const RETENTION_WEEKLY = [
  { week: 'Sem 1', rate: 92 },
  { week: 'Sem 2', rate: 81 },
  { week: 'Sem 3', rate: 74 },
  { week: 'Sem 4', rate: 68 },
  { week: 'Sem 5', rate: 61 },
  { week: 'Sem 6', rate: 58 },
  { week: 'Sem 7', rate: 55 },
  { week: 'Sem 8', rate: 54 },
]

const TOP_LESSONS = [
  { title: 'Introdução à Gestão Financeira', views: 892, completion: 88, course: 'Gestão Clínica' },
  { title: 'Precificação de Consultas',      views: 734, completion: 82, course: 'Gestão Clínica' },
  { title: 'Marketing para Clínicas VET',    views: 681, completion: 79, course: 'Marketing VET' },
  { title: 'Fluxo de Caixa na Prática',      views: 612, completion: 75, course: 'Gestão Clínica' },
  { title: 'Atendimento ao Tutor',           views: 543, completion: 71, course: 'Clínica Vet.' },
  { title: 'Equipe e Liderança',             views: 498, completion: 68, course: 'Gestão Clínica' },
  { title: 'Cirurgia: Pós-Operatório',       views: 467, completion: 65, course: 'Clínica Vet.' },
  { title: 'Protocolos Anestésicos',         views: 389, completion: 60, course: 'Clínica Vet.' },
]

const FUNNEL_DATA = [
  { name: 'Visitantes',  value: 4820, fill: '#6B7280' },
  { name: 'Cadastros',   value: 1243, fill: '#3B82F6' },
  { name: 'Matriculados',value: 687,  fill: '#E10600' },
  { name: 'Engajados',   value: 412,  fill: '#10B981' },
  { name: 'Concluíram',  value: 138,  fill: '#8B5CF6' },
]

const VET_SEGMENTS = [
  { role: 'Médico Veterinário Clínico', count: 312, pct: 34, color: '#3B82F6' },
  { role: 'Proprietário de Pet Shop',   count: 198, pct: 22, color: '#F59E0B' },
  { role: 'Gestor de Clínica',          count: 167, pct: 18, color: '#10B981' },
  { role: 'Residente / Estagiário',     count: 134, pct: 15, color: '#8B5CF6' },
  { role: 'Outros',                     count: 100, pct: 11, color: '#6B7280' },
]

const COURSE_PERFORMANCE = [
  { title: 'Gestão Clínica Avançada',   enrolled: 312, avg_progress: 74, completions: 89, revenue: 92664 },
  { title: 'Marketing Veterinário',      enrolled: 267, avg_progress: 61, completions: 54, revenue: 52533 },
  { title: 'Cirurgia para Clínicos',     enrolled: 198, avg_progress: 58, completions: 38, revenue: 58806 },
  { title: 'Gestão de Pet Shop',         enrolled: 156, avg_progress: 82, completions: 74, revenue: 30888 },
  { title: 'Oncologia Veterinária',      enrolled: 94,  avg_progress: 45, completions: 17, revenue: 27906 },
]

const TOP_ENGAGED = [
  { name: 'Dra. Camila Ferreira', lessons: 48, streak: 21, xp: 2140 },
  { name: 'Dr. Ricardo Alves',    lessons: 41, streak: 14, xp: 1830 },
  { name: 'Ana Beatriz Vet',      lessons: 38, streak: 18, xp: 1720 },
  { name: 'Marcos Pet Shop',      lessons: 35, streak: 11, xp: 1540 },
  { name: 'Dra. Fernanda Lima',   lessons: 29, streak: 7,  xp: 1210 },
]

// ─── Tooltip helpers ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, prefix = '', suffix = '' }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>
  label?: string; prefix?: string; suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.bgElevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      {label && <div style={{ color: C.textMuted, marginBottom: 6 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color ?? '#E10600', fontWeight: 600 }}>
          {p.name}: {prefix}{Number(p.value).toLocaleString('pt-BR')}{suffix}
        </div>
      ))}
    </div>
  )
}

// ─── Period selector ───────────────────────────────────────────────────────────
function PeriodTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {['7d', '30d', '90d'].map(p => (
        <button key={p} onClick={() => onChange(p)} style={{
          padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          background: value === p ? '#E10600' : 'transparent',
          color: value === p ? '#000' : C.textMuted,
          border: `1px solid ${value === p ? '#E10600' : C.border}`,
        }}>{p}</button>
      ))}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export function OwnerAnalytics() {
  const [period, setPeriod] = useState('7d')

  const kpis = [
    { label: 'Taxa de retenção (30d)', value: '68%',    delta: '+3%',  up: true,  color: '#10B981' },
    { label: 'Sessões esta semana',    value: '1.137',  delta: '+12%', up: true,  color: '#E10600' },
    { label: 'Tempo médio/sessão',     value: '24min',  delta: '-2min',up: false, color: '#3B82F6' },
    { label: 'Taxa de conclusão',      value: '22%',    delta: '+5%',  up: true,  color: '#8B5CF6' },
  ]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>
            Analytics de Engajamento
          </h1>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
            Engajamento, retenção e desempenho dos cursos — dados de mock (conecte Supabase para dados reais)
          </p>
        </div>
      </FadeIn>

      {/* KPI row */}
      <FadeIn delay={60}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {kpis.map(k => (
            <Card key={k.label} style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, marginTop: 4, color: k.up ? C.success : C.danger }}>
                {k.delta} vs período anterior
              </div>
            </Card>
          ))}
        </div>
      </FadeIn>

      {/* Engagement + Retention */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <FadeIn delay={100}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Engajamento Diário</h2>
              <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ENGAGEMENT_DAILY} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={'#E10600'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={'#E10600'} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.textMuted }} />
                <Area name="Sessões" type="monotone" dataKey="sessions" stroke={'#E10600'} strokeWidth={2} fill="url(#gSessions)" dot={false} />
                <Area name="Conclusões" type="monotone" dataKey="completions" stroke="#10B981" strokeWidth={2} fill="url(#gCompletions)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>

        <FadeIn delay={120}>
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>Retenção Semanal</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={RETENTION_WEEKLY} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 10 }} axisLine={false} tickLine={false} domain={[40, 100]} />
                <Tooltip content={<ChartTip suffix="%" />} />
                <Line name="Retenção" type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2.5}
                  dot={{ fill: '#3B82F6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ fontSize: 11, color: C.textDim, margin: '8px 0 0', textAlign: 'center' }}>
              % de alunos que retornam após primeira aula
            </p>
          </Card>
        </FadeIn>
      </div>

      {/* Funnel + VET segments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <FadeIn delay={140}>
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>
              Funil de Conversão
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FUNNEL_DATA.map((step, i) => {
                const pct = i === 0 ? 100 : Math.round((step.value / FUNNEL_DATA[0].value) * 100)
                return (
                  <div key={step.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{step.name}</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, color: step.fill, fontWeight: 700 }}>
                          {step.value.toLocaleString('pt-BR')}
                        </span>
                        <span style={{ fontSize: 11, color: C.textDim, minWidth: 36, textAlign: 'right' }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: C.surfaceHover, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: step.fill, borderRadius: 4, transition: 'width 0.5s',
                      }} />
                    </div>
                    {i < FUNNEL_DATA.length - 1 && (
                      <div style={{ fontSize: 10, color: C.textDim, textAlign: 'right', marginTop: 2 }}>
                        ↓ {Math.round((FUNNEL_DATA[i + 1].value / step.value) * 100)}% avançam
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={160}>
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>
              Perfil VET dos Alunos
            </h2>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={VET_SEGMENTS} dataKey="count" cx="50%" cy="50%"
                    innerRadius={32} outerRadius={56} paddingAngle={2}>
                    {VET_SEGMENTS.map(seg => (
                      <Cell key={seg.role} fill={seg.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {VET_SEGMENTS.map(seg => (
                  <div key={seg.role}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 11, color: C.textMuted }}>{seg.role}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: seg.color }}>{seg.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: C.surfaceHover, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${seg.pct}%`, background: seg.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Top lessons */}
      <FadeIn delay={180}>
        <Card style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>
            Aulas Mais Assistidas
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['#', 'Aula', 'Curso', 'Visualizações', 'Taxa de Conclusão'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px', fontSize: 11,
                      color: C.textDim, fontWeight: 700, letterSpacing: '0.04em',
                      textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_LESSONS.map((l, i) => (
                  <tr key={l.title}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ transition: 'background 0.12s' }}
                  >
                    <td style={{ padding: '11px 12px', color: C.textDim, fontWeight: 700 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </td>
                    <td style={{ padding: '11px 12px', color: C.text, fontWeight: 500 }}>{l.title}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <Badge variant="muted" style={{ fontSize: 10 }}>{l.course}</Badge>
                    </td>
                    <td style={{ padding: '11px 12px', color: '#E10600', fontWeight: 700 }}>
                      {l.views.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '11px 12px', minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Progress value={l.completion}
                            color={l.completion >= 80 ? C.success : l.completion >= 60 ? '#E10600' : C.danger}
                            height={4} />
                        </div>
                        <span style={{ fontSize: 11, color: C.textMuted, minWidth: 30, textAlign: 'right' }}>
                          {l.completion}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>

      {/* Course performance + Top engaged */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        <FadeIn delay={200}>
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>
              Desempenho por Curso
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {COURSE_PERFORMANCE.map(cp => (
                <div key={cp.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{cp.title}</span>
                    <span style={{ fontSize: 12, color: '#E10600', fontWeight: 700 }}>
                      R$ {cp.revenue.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.textDim }}>
                      👥 {cp.enrolled} matriculados
                    </span>
                    <span style={{ fontSize: 11, color: C.textDim }}>
                      🏆 {cp.completions} concluíram
                    </span>
                    <span style={{ fontSize: 11, color: cp.avg_progress >= 70 ? C.success : C.textDim }}>
                      📈 {cp.avg_progress}% progresso médio
                    </span>
                  </div>
                  <Progress value={cp.avg_progress}
                    color={cp.avg_progress >= 70 ? C.success : cp.avg_progress >= 50 ? '#E10600' : C.danger}
                    height={4} />
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={220}>
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 16px' }}>
              🔥 Top Alunos Engajados
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TOP_ENGAGED.map((s, i) => (
                <div key={s.name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  paddingBottom: 12, borderBottom: i < TOP_ENGAGED.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#6B7280' : C.surfaceHover,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: i < 3 ? '#000' : C.textDim,
                  }}>{i + 1}</span>
                  <Avatar name={s.name} size={32} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim }}>
                      {s.lessons} aulas · {s.streak}🔥 dias
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#E10600',
                    padding: '2px 7px', background: `${'#E10600'}1A`,
                    borderRadius: 8, border: `1px solid ${'#E10600'}44`,
                  }}>{s.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Reengagement info */}
      <FadeIn delay={240}>
        <Card style={{ background: `${'#E10600'}0A`, border: `1px solid ${'#E10600'}33` }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E10600', margin: '0 0 8px' }}>
                📧 Automação de Reengajamento
              </h3>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>
                Alunos que não acessam há mais de 7 dias recebem um email automático de reengajamento.
                Configure sua Edge Function <code style={{ background: C.surfaceHover, padding: '1px 5px', borderRadius: 4 }}>reengagement-email</code> no Supabase para ativar.
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Em risco (7+ dias)',     value: '34',   color: C.danger },
                  { label: 'Inativos (30+ dias)',    value: '12',   color: '#6B7280' },
                  { label: 'Reengajados (30d)',      value: '28',   color: C.success },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.8, flexShrink: 0 }}>
              <div>✅ Email Dia 1: Boas-vindas</div>
              <div>📬 Email Dia 7: Alunos sem acesso</div>
              <div>🔔 Email Dia 14: Conteúdo novo</div>
              <div>💡 Email Dia 30: Oferta especial</div>
            </div>
          </div>
        </Card>
      </FadeIn>
    </PageLayout>
  )
}
