import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { Avatar } from '../../components/ui/Avatar'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MOCK_DASHBOARD_STATS, MOCK_MONTHLY_REVENUE, MOCK_RECENT_SALES } from '../../data/mock'
import { supabase } from '../../lib/supabase'
import { USE_MOCK_DATA } from '../../lib/features'

// ─── Operational Alerts ───────────────────────────────────────────────────────
interface Alert { id: string; type: 'warning' | 'danger' | 'info'; icon: string; title: string; desc: string; action?: string; actionPath?: string }

function AlertsSection() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nl_dismissed_alerts') ?? '[]')) } catch { return new Set() }
  })

  useEffect(() => {
    async function load() {
      const list: Alert[] = []
      if (supabase) {
        try {
          // Pagamentos pendentes/vencidos
          const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString()
          const { data: overduePayments } = await supabase
            .from('payments').select('id', { count: 'exact', head: true })
            .eq('status', 'overdue')
          const overdueCount = (overduePayments as unknown as { count?: number } | null)?.count ?? 0
          if (overdueCount > 0) {
            list.push({ id: 'overdue_payments', type: 'danger', icon: '⚠️', title: `${overdueCount} pagamento${overdueCount > 1 ? 's' : ''} vencido${overdueCount > 1 ? 's' : ''}`, desc: 'Boletos não pagos podem indicar desistência. Verifique e entre em contato com os alunos.', action: 'Ver pagamentos', actionPath: '/admin/pagamentos' })
          }
          // Alunos sem acesso a cursos
          const { data: noCoursesStudents } = await supabase
            .from('profiles').select('id', { count: 'exact', head: true })
            .eq('role', 'student')
            .not('id', 'in', supabase.from('enrollments').select('user_id'))
          const noCourses = (noCoursesStudents as unknown as { count?: number } | null)?.count ?? 0
          if (noCourses > 3) {
            list.push({ id: 'no_courses', type: 'warning', icon: '📚', title: `${noCourses} alunos sem matrícula`, desc: 'Esses alunos criaram conta mas não estão matriculados em nenhum curso.', action: 'Ver alunos', actionPath: '/admin/alunos' })
          }
          // Alunos inativos (sem progresso há 7+ dias)
          const { data: inactiveData } = await supabase
            .from('profiles').select('id', { count: 'exact', head: true })
            .eq('role', 'student')
            .lt('last_login_at', sevenDaysAgo)
          const inactiveCount = (inactiveData as unknown as { count?: number } | null)?.count ?? 0
          if (inactiveCount > 0) {
            list.push({ id: 'inactive_students', type: 'info', icon: '💤', title: `${inactiveCount} aluno${inactiveCount > 1 ? 's' : ''} inativo${inactiveCount > 1 ? 's' : ''} há 7+ dias`, desc: 'Considere enviar um e-mail de reengajamento com conteúdo novo ou lembrete de aulas.', action: 'Ver alunos', actionPath: '/admin/alunos' })
          }
        } catch { /* Supabase not configured — use fallback below */ }
      }
      // Fallback / always-show informational alerts
      if (list.length === 0) {
        list.push({ id: 'demo_revenue', type: 'info', icon: '📈', title: 'Dados de demonstração ativos', desc: 'Conecte o Supabase para ver alertas em tempo real sobre alunos inativos e pagamentos pendentes.' })
      }
      setAlerts(list)
    }
    load()
  }, [])

  function dismiss(id: string) {
    const next = new Set(dismissed).add(id)
    setDismissed(next)
    localStorage.setItem('nl_dismissed_alerts', JSON.stringify([...next]))
  }

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  const colorMap = {
    danger:  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '#f59e0b' },
    info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', icon: '#818cf8' },
  }

  return (
    <FadeIn>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Alertas operacionais
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(alert => {
            const c = colorMap[alert.type]
            return (
              <div key={alert.id} style={{
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: 12, padding: '14px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{alert.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{alert.desc}</div>
                  {alert.action && alert.actionPath && (
                    <button onClick={() => navigate(alert.actionPath!)} style={{
                      marginTop: 8, background: 'none', border: 'none', padding: 0,
                      color: c.icon, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                      {alert.action} →
                    </button>
                  )}
                </div>
                <button onClick={() => dismiss(alert.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.textDim, fontSize: 16, padding: 0, flexShrink: 0,
                }} title="Dispensar">×</button>
              </div>
            )
          })}
        </div>
      </div>
    </FadeIn>
  )
}

function KpiCard({ icon, label, value, sub, color = '#E10600' }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string
}) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{label}</div>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{sub}</div>}
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: C.bgElevated, border: `1px solid ${C.borderSubtle}`,
      borderRadius: 8, padding: '8px 12px', fontSize: 13,
    }}>
      <div style={{ color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#E10600', fontWeight: 700 }}>
        R$ {payload[0].value.toLocaleString('pt-BR')}
      </div>
    </div>
  )
}

export function OwnerDashboard() {
  const stats = USE_MOCK_DATA
    ? MOCK_DASHBOARD_STATS
    : { revenue_total: 0, revenue_monthly: 0, active_students: 0, monthly_sales: 0, completion_rate: 0 }
  const monthlyRevenue = USE_MOCK_DATA ? MOCK_MONTHLY_REVENUE : []
  const recentSales = USE_MOCK_DATA ? MOCK_RECENT_SALES : []

  const kpis = [
    { icon: <Icons.TrendingUp size={20} />, label: 'Receita total', value: `R$ ${(stats.revenue_total / 1000).toFixed(0)}k`, sub: '↑ 12% vs mês anterior' },
    { icon: <Icons.Zap size={20} />, label: 'Receita mensal', value: `R$ ${stats.revenue_monthly.toLocaleString('pt-BR')}`, sub: 'Janeiro 2025' },
    { icon: <Icons.Users size={20} />, label: 'Alunos ativos', value: stats.active_students.toLocaleString('pt-BR'), sub: '↑ 8% vs mês anterior' },
    { icon: <Icons.Tag size={20} />, label: 'Vendas no mês', value: String(stats.monthly_sales), sub: 'últimos 30 dias' },
    { icon: <Icons.Medal size={20} />, label: 'Taxa de conclusão', value: `${stats.completion_rate}%`, sub: 'média geral' },
  ]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>
            Dashboard
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Visão geral do desempenho da sua plataforma.
          </p>
        </div>
      </FadeIn>

      {/* Operational alerts */}
      <AlertsSection />

      {/* KPIs */}
      <FadeIn delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <FadeIn delay={160}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>Receita Mensal</h2>
              <Badge variant="primary">12 meses</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={'#E10600'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={'#E10600'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={'#E10600'} strokeWidth={2}
                  fill="url(#redGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>

        {/* Category breakdown */}
        <FadeIn delay={200}>
          <Card>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 20px' }}>
              Vendas por Categoria
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { cat: 'Tráfego', v: 42 },
                { cat: 'Marketing', v: 35 },
                { cat: 'Vendas', v: 28 },
                { cat: 'Mentoria', v: 22 },
                { cat: 'Social', v: 18 },
                { cat: 'Mente', v: 14 },
              ]} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="cat" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => active && payload?.length ? (
                    <div style={{ background: C.bgElevated, border: `1px solid ${C.borderSubtle}`, borderRadius: 8, padding: '6px 10px', fontSize: 13, color: '#E10600' }}>
                      {payload[0].value} vendas
                    </div>
                  ) : null} />
                <Bar dataKey="v" fill={'#E10600'} fillOpacity={0.7} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </FadeIn>
      </div>

      {/* Recent sales */}
      <FadeIn delay={240}>
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 20px' }}>
            Vendas Recentes
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Aluno', 'Curso', 'Valor', 'Status', 'Data'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px',
                      color: C.textDim, fontSize: 12, fontWeight: 600,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.borderSubtle}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={sale.user?.name ?? ''} size={32} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{sale.user?.name}</div>
                          <div style={{ fontSize: 11, color: C.textDim }}>{sale.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: C.textMuted, fontSize: 13 }}>
                      {sale.course?.title}
                    </td>
                    <td style={{ padding: '12px 12px', fontWeight: 700, color: '#E10600' }}>
                      R$ {sale.amount.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <Badge variant={sale.status === 'paid' ? 'success' : 'danger'}>
                        {sale.status === 'paid' ? 'Pago' : 'Estornado'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 12px', color: C.textDim, fontSize: 12 }}>
                      {new Date(sale.created_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
    </PageLayout>
  )
}
