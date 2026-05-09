import { useState } from 'react'
import { C } from '../../lib/theme'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Icons } from '../icons'
import { createPayment, formatBRL } from '../../lib/asa'
import { useAuth } from '../../contexts/AuthContext'
import { PAYMENTS_ENABLED } from '../../lib/features'
import type { Course } from '../../types'

interface CheckoutModalProps {
  course: Course
  productId: string
  onClose: () => void
  onSuccess: () => void
}

type Step = 'form' | 'pix' | 'success'
type Method = 'PIX' | 'CREDIT_CARD' | 'BOLETO'

function CPFMask(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false // todos iguais (ex: 111.111.111-11)
  const sum1 = digits.slice(0, 9).split('').reduce((acc, d, i) => acc + Number(d) * (10 - i), 0)
  const rem1 = (sum1 * 10) % 11
  const d1 = rem1 === 10 || rem1 === 11 ? 0 : rem1
  if (d1 !== Number(digits[9])) return false
  const sum2 = digits.slice(0, 10).split('').reduce((acc, d, i) => acc + Number(d) * (11 - i), 0)
  const rem2 = (sum2 * 10) % 11
  const d2 = rem2 === 10 || rem2 === 11 ? 0 : rem2
  return d2 === Number(digits[10])
}

export function CheckoutModal({ course, productId, onClose, onSuccess }: CheckoutModalProps) {
  const { user } = useAuth()

  // Segurança: se pagamentos desativados, nunca renderiza o modal
  if (!PAYMENTS_ENABLED) return null
  const [step, setStep] = useState<Step>('form')
  const [method, setMethod] = useState<Method>('PIX')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<{ qrCode: string; copiaECola: string } | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const discount = course.price_old
    ? Math.round((1 - course.price / course.price_old) * 100)
    : 0

  async function handlePay() {
    const cpfRaw = cpf.replace(/\D/g, '')
    if (!validateCPF(cpfRaw)) { setError('CPF inválido. Verifique os números digitados.'); return }
    if (!user) { setError('Usuário não autenticado'); return }

    setError('')
    setLoading(true)
    try {
      const result = await createPayment({
        productId,
        productType: 'course',
        productTitle: course.title,
        amount: course.price,
        paymentMethod: method,
        customer: { name: user.name, email: user.email, cpf: cpfRaw },
      })

      if (method === 'PIX' && result.pixQrCode) {
        setPixData({ qrCode: result.pixQrCode, copiaECola: result.pixCopiaECola ?? '' })
        setStep('pix')
      } else if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl)
        window.open(result.checkoutUrl, '_blank')
        setStep('success')
      } else {
        setStep('success')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar pagamento'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function copyPix() {
    if (pixData?.copiaECola) {
      navigator.clipboard.writeText(pixData.copiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: C.bgCard, borderRadius: 20, border: `1px solid ${C.borderSubtle}`,
        width: '100%', maxWidth: 480, padding: 32, position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted,
        }}>
          <Icons.X size={20} />
        </button>

        {/* Step: Form */}
        {step === 'form' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
              Finalizar compra
            </h2>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 24px' }}>
              Pagamento seguro via Asaas
            </p>

            {/* Product summary */}
            <div style={{
              background: C.bgElevated, borderRadius: 12, padding: 16,
              marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                background: course.thumbnail_gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>
                {course.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {course.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#E10600' }}>
                    {formatBRL(course.price)}
                  </span>
                  {course.price_old && (
                    <span style={{ fontSize: 12, color: C.textDim, textDecoration: 'line-through' }}>
                      {formatBRL(course.price_old)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span style={{ fontSize: 11, background: 'rgba(74,222,128,0.15)', color: C.success, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, display: 'block', marginBottom: 10 }}>
                Forma de pagamento
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {([
                  { m: 'PIX', icon: '⚡', label: 'PIX', sub: 'Aprovação imediata' },
                  { m: 'CREDIT_CARD', icon: '💳', label: 'Cartão', sub: 'Crédito/débito' },
                  { m: 'BOLETO', icon: '📄', label: 'Boleto', sub: '1-3 dias úteis' },
                ] as const).map(({ m, icon, label, sub }) => (
                  <button key={m} type="button" onClick={() => setMethod(m)} style={{
                    padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${method === m ? C.borderRed : C.borderSubtle}`,
                    background: method === m ? 'rgba(225,6,0,0.08)' : 'transparent',
                    textAlign: 'center', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: method === m ? '#E10600' : C.text }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* CPF */}
            <div style={{ marginBottom: 20 }}>
              <Input
                label="CPF (obrigatório para emissão da nota fiscal)"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(CPFMask(e.target.value))}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                fontSize: 13, color: C.danger,
              }}>
                {error}
              </div>
            )}

            <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handlePay}
              icon={<Icons.Zap size={16} />}>
              {method === 'PIX' ? 'Gerar PIX' : method === 'CREDIT_CARD' ? 'Pagar com cartão' : 'Gerar boleto'} · {formatBRL(course.price)}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 11, color: C.textDim, marginTop: 12 }}>
              🔒 Pagamento processado com segurança pela Asaas
            </p>
          </>
        )}

        {/* Step: PIX QR Code */}
        {step === 'pix' && pixData && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: '0 0 4px' }}>
              Pague com PIX
            </h2>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 24px' }}>
              O acesso é liberado assim que o pagamento for confirmado.
            </p>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src={pixData.qrCode} alt="QR Code PIX" style={{ width: 200, height: 200, borderRadius: 12 }} />
            </div>

            <div style={{
              background: C.bgElevated, borderRadius: 10, padding: '12px 14px',
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <code style={{ flex: 1, fontSize: 11, color: C.textMuted, wordBreak: 'break-all', lineHeight: 1.5 }}>
                {pixData.copiaECola.slice(0, 60)}...
              </code>
              <Button variant="outline" size="sm" onClick={copyPix} icon={<Icons.Check size={12} />}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>

            <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>
              Após o pagamento, seu acesso ao curso será liberado automaticamente.
              Você receberá um e-mail de confirmação.
            </div>

            <Button variant="ghost" fullWidth onClick={() => setStep('success')}>
              Já paguei
            </Button>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
              Pagamento realizado!
            </h2>
            <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              {method === 'PIX' || method === 'CREDIT_CARD'
                ? 'Seu acesso foi liberado. Bons estudos!'
                : 'Seu boleto foi gerado. O acesso será liberado após a confirmação do pagamento (1-3 dias úteis).'}
            </p>
            {checkoutUrl && method !== 'PIX' && (
              <a href={checkoutUrl} target="_blank" rel="noreferrer"
                style={{ display: 'block', marginBottom: 16, color: '#E10600', fontSize: 13 }}>
                Acessar página de pagamento →
              </a>
            )}
            <Button variant="primary" fullWidth onClick={onSuccess}>
              Ir para o curso
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
