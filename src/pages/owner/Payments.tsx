import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { formatBRL } from '../../lib/asa'
import { USE_MOCK_DATA } from '../../lib/features'
import type { Payment, PaymentStatus } from '../../types'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay1', user_id: 'u1', asa_payment_id: 'pay_abc123',
    product_type: 'course', product_id: 'p1', amount: 497,
    status: 'confirmed', payment_method: 'pix',
    paid_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    user: { name: 'Ana Beatriz', email: 'ana@email.com' },
    product: { title: 'Gestão Clínica Avançada' },
  },
  {
    id: 'pay2', user_id: 'u2', asa_payment_id: 'pay_def456',
    product_type: 'subscription', product_id: 'p2', amount: 97,
    status: 'confirmed', payment_method: 'credit_card',
    paid_at: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 3600 * 24).toISOString(),
    user: { name: 'Carlos Henrique', email: 'carlos@email.com' },
    product: { title: 'Plano Mensal — Acesso Total' },
  },
  {
    id: 'pay3', user_id: 'u3', asa_payment_id: 'pay_ghi789',
    product_type: 'course', product_id: 'p1', amount: 497,
    status: 'pending', payment_method: 'boleto',
    created_at: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
    user: { name: 'Marcos Pet', email: 'marcos@email.com' },
    product: { title: 'Gestão Clínica Avançada' },
  },
  {
    id: 'pay4', user_id: 'u4', asa_payment_id: 'pay_jkl012',
    product_type: 'subscription', product_id: 'p2', amount: 97,
    status: 'overdue', payment_method: 'credit_card',
    created_at: new Date(Date.now() - 1000 * 3600 * 72).toISOString(),
    user: { name: 'Fernanda Lima', email: 'fernanda@email.com' },
    product: { title: 'Plano Mensal — Acesso Total' },
  },
  {
    id: 'pay5', user_id: 'u5', asa_payment_id: 'pay_mno345',
    product_type: 'ebook', product_id: 'p4', amount: 47,
    status: 'confirmed', payment_method: 'pix',
    paid_at: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    created_at: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
    user: { name: 'Dr. Roberto Santos', email: 'roberto@email.com' },
    product: { title: 'Planilha de Precificação VET' },
  },
  {
    id: 'pay6', user_id: 'u6', asa_payment_id: 'pay_pqr678',
    product_type: 'course', product_id: 'p1', amount: 497,
    status: 'refunded', payment_method: 'credit_card',
    created_at: new Date(Date.now() - 1000 * 3600 * 96).toISOString(),
    user: { name: 'Juliana Vet', email: 'juliana@email.com' },
    product: { title: 'Gestão Clínica Avançada' },
  },
]

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'success' | 'muted' | 'danger' | 'primary'; icon: string }> = {
  confirmed: { label: 'Confirmado', variant: 'success', icon: '✓' },
  pending:   { label: 'Pendente',   variant: 'primary', icon: '⏳' },
  overdue:   { label: 'Vencido',    variant: 'danger',  icon: '!' },
  refunded:  { label: 'Reembolsado',variant: 'muted',   icon: '↩' },
  cancelled: { label: 'Cancelado',  variant: 'muted',   icon: '✕' },
}

const METHOD_LABEL: Record<string, string> = {
  pix: '⚡ PIX', credit_card: '💳 Cartão', boleto: '📄 Boleto',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function OwnerPayments() {
  const [payments] = useState<Payment[]>(USE_MOCK_DATA ? MOCK_PAYMENTS : [])
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all')

  const filtered = payments.filter(p => statusFilter === 'all' || p.status === statusFilter)

  const totalConfirmed = payments
    .filter(p => p.status === 'confirmed')
    .reduce((s, p) => s + p.amount, 0)
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0)
  const totalOverdue = payments
    .filter(p => p.status === 'overdue')
    .reduce((s, p) => s + p.amount, 0)

  function exportCSV() {
    const header = 'ID,Aluno,Email,Produto,Valor,Método,Status,Data\n'
    const rows = filtered.map(p =>
      `${p.asa_payment_id},${p.user?.name},${p.user?.email},${p.product?.title},${p.amount},${p.payment_method},${p.status},${fmtDate(p.created_at)}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'pagamentos.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 1040 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>Pagamentos</h1>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                Integração ASA · {payments.length} transações
              </p>
            </div>
            <Button variant="outline" onClick={exportCSV} icon={<Icons.Download size={14} />}>
              Exportar CSV
            </Button>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Receita confirmada', value: formatBRL(totalConfirmed), color: C.success, icon: '💰' },
              { label: 'Aguardando pagamento', value: formatBRL(totalPending), color: '#E10600', icon: '⏳' },
              { label: 'Inadimplente', value: formatBRL(totalOverdue), color: C.danger, icon: '⚠️' },
              { label: 'Total de transações', value: String(payments.length), color: C.text, icon: '📊' },
            ].map(k => (
              <Card key={k.label} style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: k.color, marginBottom: 2 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['all', 'confirmed', 'pending', 'overdue', 'refunded', 'cancelled'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 13,
                fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${statusFilter === s ? C.borderActive : C.borderSubtle}`,
                background: statusFilter === s ? 'rgba(225,6,0,0.12)' : 'transparent',
                color: statusFilter === s ? '#E10600' : C.textMuted,
                fontWeight: statusFilter === s ? 600 : 400,
              }}>
                {s === 'all' ? 'Todos' : STATUS_CONFIG[s as PaymentStatus].label}
              </button>
            ))}
          </div>

          {/* Transactions table */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                    {['Aluno', 'Produto', 'Valor', 'Método', 'Status', 'Data'].map(h => (
                      <th key={h} style={{
                        padding: '14px 20px', textAlign: 'left', fontSize: 12,
                        color: C.textMuted, fontWeight: 600, letterSpacing: '0.04em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pay, i) => {
                    const sc = STATUS_CONFIG[pay.status]
                    return (
                      <tr key={pay.id}
                        style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                            {pay.user?.name ?? '—'}
                          </div>
                          <div style={{ fontSize: 12, color: C.textDim }}>{pay.user?.email}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: 13, color: C.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pay.product?.title ?? '—'}
                          </div>
                          <div style={{ fontSize: 11, color: C.textDim }}>{pay.asa_payment_id}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#E10600' }}>
                            {formatBRL(pay.amount)}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 13, color: C.textMuted }}>
                            {METHOD_LABEL[pay.payment_method ?? ''] ?? '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <Badge variant={sc.variant}>
                            {sc.icon} {sc.label}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: 13, color: C.textMuted }}>
                            {fmtDate(pay.paid_at ?? pay.created_at)}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
                  <p>Nenhuma transação encontrada.</p>
                </div>
              )}
            </div>
          </Card>

          {/* ASA Webhook config box */}
          <div style={{
            marginTop: 20, padding: '16px 20px', borderRadius: 12,
            background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>
              ⚙️ Configuração do Webhook ASA
            </h3>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 12px', lineHeight: 1.6 }}>
              Para que os pagamentos sejam atualizados automaticamente, configure o webhook no painel da Asaas
              apontando para sua Supabase Edge Function:
            </p>
            <div style={{
              background: C.bgElevated, borderRadius: 8, padding: '10px 14px',
              fontFamily: 'monospace', fontSize: 12, color: C.textDim,
              wordBreak: 'break-all',
            }}>
              {`https://<seu-projeto>.supabase.co/functions/v1/asa-webhook`}
            </div>
            <p style={{ fontSize: 12, color: C.textDim, margin: '8px 0 0' }}>
              Eventos necessários: <strong>payment.confirmed</strong>, <strong>payment.overdue</strong>,{' '}
              <strong>subscription.cancelled</strong>
            </p>
          </div>
        </div>
      </FadeIn>
    </PageLayout>
  )
}
