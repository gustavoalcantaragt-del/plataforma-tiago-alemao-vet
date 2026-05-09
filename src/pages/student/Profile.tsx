import { useState, useEffect, useCallback } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { formatBRL } from '../../lib/asa'
import { useXP, getLevelProgress, getNextLevel } from '../../hooks/useXP'
import { useProgress } from '../../hooks/useProgress'
import { useEnrolledCourses } from '../../hooks/useCourses'
import { MOCK_MODULES } from '../../data/mock'
import type { Payment, PaymentStatus } from '../../types'

const PROFESSIONAL_ROLES = [
  { value: 'veterinario_autonomo', label: 'Médico Veterinário Autônomo' },
  { value: 'dono_clinica', label: 'Dono de Clínica Veterinária' },
  { value: 'gestor_clinica', label: 'Gestor de Clínica Veterinária' },
  { value: 'dono_petshop', label: 'Dono de Pet Shop' },
  { value: 'estudante_veterinaria', label: 'Estudante de Veterinária' },
  { value: 'outro', label: 'Outro profissional do mercado pet' },
]

const YEARS_OPTIONS = ['Menos de 1 ano', '1-3 anos', '3-5 anos', '5-10 anos', 'Mais de 10 anos']
const REVENUE_OPTIONS = ['Até R$5k/mês', 'R$5k-15k/mês', 'R$15k-30k/mês', 'R$30k-60k/mês', 'Acima de R$60k/mês']
const EMPLOYEES_OPTIONS = ['Só eu', '2-5 colaboradores', '6-15 colaboradores', '16-30 colaboradores', 'Mais de 30']

const BRAZIL_STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']

interface VetProfile {
  professional_role: string
  years_experience: string
  clinic_size: string
  employee_count: string
  revenue_range: string
  specialty: string
  city: string
  state: string
  goals: string
  crm: string
}

export function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState<'dados' | 'profissional' | 'senha' | 'pagamentos'>('dados')

  // Stats reais
  const { totalXP, level, streakDays } = useXP()
  const { progress: progressMap } = useProgress(user?.id ?? '')
  const { courses } = useEnrolledCourses(user?.id ?? '')
  const allLessonIds = MOCK_MODULES.flatMap(m => m.lessons.map(l => l.id))
  const completedLessons = allLessonIds.filter(id => !!progressMap[id]).length
  const studyHours = Math.floor(completedLessons * 0.35)
  const completedCourses = courses.filter(c => {
    const ids = MOCK_MODULES.filter(m => m.course_id === c.id).flatMap(m => m.lessons.map(l => l.id))
    return ids.length > 0 && ids.every(id => !!progressMap[id])
  }).length
  const nextLvl = getNextLevel(totalXP)
  const lvlPct = getLevelProgress(totalXP)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Dados pessoais
  const [name, setName] = useState(user?.name ?? '')

  // Perfil VET
  const [vetProfile, setVetProfile] = useState<VetProfile>({
    professional_role: '', years_experience: '', clinic_size: '',
    employee_count: '', revenue_range: '', specialty: '',
    city: '', state: '', goals: '', crm: '',
  })

  // Senha
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passError, setPassError] = useState('')

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from('user_profiles_vet').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setVetProfile(p => ({ ...p, ...data }))
      })
  }, [user])

  async function savePersonal() {
    if (!supabase || !user) return
    setSaving(true)
    await supabase.from('profiles').update({ name }).eq('id', user.id)
    await refreshUser()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function saveVetProfile() {
    if (!supabase || !user) return
    setSaving(true)
    await supabase.from('user_profiles_vet').upsert({ ...vetProfile, user_id: user.id })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function changePassword() {
    setPassError('')
    if (newPass.length < 6) { setPassError('Mínimo 6 caracteres'); return }
    if (newPass !== confirmPass) { setPassError('As senhas não coincidem'); return }
    if (!supabase) return
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) { setPassError(error.message); setSaving(false); return }
    setNewPass(''); setConfirmPass('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  // Pagamentos
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  const loadPayments = useCallback(async () => {
    if (!supabase || !user) return
    setPaymentsLoading(true)
    const { data } = await supabase
      .from('payments')
      .select('*, product:products(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setPayments((data as Payment[]) ?? [])
    setPaymentsLoading(false)
  }, [user])

  useEffect(() => {
    if (tab === 'pagamentos') loadPayments()
  }, [tab, loadPayments])

  const field = (key: keyof VetProfile) => ({
    value: vetProfile[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setVetProfile(p => ({ ...p, [key]: e.target.value })),
  })

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 720 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
            <Avatar name={user?.name ?? 'U'} src={user?.avatar_url} size={64} />
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 24, color: C.text, margin: '0 0 4px' }}>
                {user?.name}
              </h1>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: C.textMuted }}>{user?.email}</span>
                <Badge variant="primary">Aluno</Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '⚡', label: 'XP Total', value: totalXP.toLocaleString('pt-BR') },
              { icon: '🔥', label: 'Sequência', value: `${streakDays} dias` },
              { icon: '✅', label: 'Aulas concluídas', value: completedLessons },
              { icon: '⏱', label: 'Horas de estudo', value: `${studyHours}h` },
              { icon: '🏆', label: 'Certificados', value: completedCourses },
            ].map(s => (
              <Card key={s.label} style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* XP Level progress */}
          <Card style={{ marginBottom: 28, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>{level.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Nível {level.level} — {level.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{totalXP} XP acumulados</div>
                </div>
              </div>
              {nextLvl && (
                <div style={{ fontSize: 12, color: C.textMuted, textAlign: 'right' }}>
                  Próximo: {nextLvl.icon} {nextLvl.name}
                  <br /><span style={{ color: '#E10600', fontWeight: 600 }}>{nextLvl.xpRequired - totalXP} XP</span> faltando
                </div>
              )}
            </div>
            <Progress value={lvlPct} />
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, textAlign: 'right' }}>{lvlPct}% para o próximo nível</div>
          </Card>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.borderSubtle}`, paddingBottom: 0 }}>
            {([
              { key: 'dados', label: 'Dados pessoais' },
              { key: 'profissional', label: 'Perfil profissional' },
              { key: 'senha', label: 'Alterar senha' },
              { key: 'pagamentos', label: 'Pagamentos' },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  color: tab === t.key ? '#E10600' : C.textMuted,
                  borderBottom: `2px solid ${tab === t.key ? '#E10600' : 'transparent'}`,
                  marginBottom: -1, transition: 'all 0.2s',
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* Dados pessoais */}
          {tab === 'dados' && (
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Input
                  label="Nome completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                />
                <Input
                  label="E-mail"
                  value={user?.email ?? ''}
                  disabled
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {saved && <span style={{ color: C.success, fontSize: 13, alignSelf: 'center' }}>✓ Salvo!</span>}
                  <Button variant="primary" loading={saving} onClick={savePersonal}>
                    Salvar dados
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Perfil profissional VET */}
          {tab === 'profissional' && (
            <Card>
              <p style={{ color: C.textMuted, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
                Essas informações nos ajudam a personalizar sua experiência e oferecer conteúdos relevantes para seu perfil.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Input label="Perfil profissional" as="select" {...field('professional_role')}>
                  <option value="">Selecione...</option>
                  {PROFESSIONAL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Input>

                <Input label="CRM (se veterinário)" placeholder="CRM/XX 000000" {...field('crm')} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Input label="Tempo de atuação" as="select" {...field('years_experience')}>
                    <option value="">Selecione...</option>
                    {YEARS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </Input>
                  <Input label="Faturamento aproximado" as="select" {...field('revenue_range')}>
                    <option value="">Selecione...</option>
                    {REVENUE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </Input>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Input label="Quantidade de colaboradores" as="select" {...field('employee_count')}>
                    <option value="">Selecione...</option>
                    {EMPLOYEES_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </Input>
                  <Input label="Área de especialidade" placeholder="Ex: Pequenos animais, Equinos..." {...field('specialty')} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
                  <Input label="Cidade" placeholder="Sua cidade" {...field('city')} />
                  <Input label="Estado" as="select" style={{ width: 100 }} {...field('state')}>
                    <option value="">UF</option>
                    {BRAZIL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Input>
                </div>

                <Input
                  label="Seus objetivos na plataforma"
                  as="textarea"
                  rows={3}
                  placeholder="O que você espera aprender ou conquistar aqui?"
                  {...field('goals')}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {saved && <span style={{ color: C.success, fontSize: 13, alignSelf: 'center' }}>✓ Perfil salvo!</span>}
                  <Button variant="primary" loading={saving} onClick={saveVetProfile}>
                    Salvar perfil
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Alterar senha */}
          {tab === 'senha' && (
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Input
                  label="Nova senha"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
                <Input
                  label="Confirmar nova senha"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                />

                {passError && (
                  <div style={{
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger,
                  }}>{passError}</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {saved && <span style={{ color: C.success, fontSize: 13, alignSelf: 'center' }}>✓ Senha alterada!</span>}
                  <Button variant="primary" loading={saving} onClick={changePassword}>
                    Alterar senha
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Pagamentos */}
          {tab === 'pagamentos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                  Histórico de compras e assinaturas
                </p>
                <Button variant="ghost" size="sm" onClick={loadPayments}>
                  Atualizar
                </Button>
              </div>

              {paymentsLoading && (
                <div style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>Carregando...</div>
              )}

              {!paymentsLoading && payments.length === 0 && (
                <Card style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
                  <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
                    Você ainda não realizou nenhuma compra.
                  </p>
                </Card>
              )}

              {payments.map(pay => {
                const statusConfig: Record<PaymentStatus, { label: string; color: string }> = {
                  confirmed: { label: '✓ Confirmado', color: C.success },
                  pending:   { label: '⏳ Pendente',  color: '#E10600' },
                  overdue:   { label: '⚠ Vencido',   color: C.danger },
                  refunded:  { label: '↩ Reembolsado',color: C.textMuted },
                  cancelled: { label: '✕ Cancelado',  color: C.textMuted },
                }
                const sc = statusConfig[pay.status]
                const methodLabel: Record<string, string> = {
                  pix: '⚡ PIX', credit_card: '💳 Cartão', boleto: '📄 Boleto',
                }
                return (
                  <Card key={pay.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                          {pay.product?.title ?? 'Produto'}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textDim }}>
                          <span>{methodLabel[pay.payment_method ?? ''] ?? '—'}</span>
                          <span>{new Date(pay.created_at).toLocaleDateString('pt-BR')}</span>
                          {pay.asa_payment_id && <span style={{ fontFamily: 'monospace' }}>{pay.asa_payment_id}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#E10600' }}>
                          {formatBRL(pay.amount)}
                        </div>
                        <div style={{ fontSize: 12, color: sc.color, marginTop: 4 }}>
                          {sc.label}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </PageLayout>
  )
}
