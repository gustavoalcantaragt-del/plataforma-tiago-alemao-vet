import { useState, useEffect } from 'react'
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
import { formatBRL } from '../../lib/asa'
import { supabase } from '../../lib/supabase'
import { USE_MOCK_DATA } from '../../lib/features'
import { MOCK_PRODUCTS } from '../../data/mock'
import type { Product, ProductType, AccessType } from '../../types'


const TYPE_LABELS: Record<ProductType, string> = {
  course: 'Curso', ebook: 'E-book / PDF', subscription: 'Assinatura', bundle: 'Bundle',
}
const TYPE_EMOJI: Record<ProductType, string> = {
  course: '🎓', ebook: '📄', subscription: '♻️', bundle: '📦',
}
const ACCESS_LABELS: Record<AccessType, string> = {
  free: 'Gratuito', paid_once: 'Pagamento único', subscription: 'Assinatura recorrente',
}

// ─── Form modal ───────────────────────────────────────────────────────────────
interface ProductFormProps {
  initial?: Partial<Product>
  onSave: (p: Partial<Product>) => void
  onClose: () => void
}

function ProductForm({ initial, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState<Partial<Product>>({
    title: '', description: '', type: 'course', access_type: 'paid_once',
    price: 0, price_old: undefined, is_active: true, ...initial,
  })

  const set = (k: keyof Product, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: C.bgCard, borderRadius: 16, border: `1px solid ${C.borderSubtle}`,
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, margin: 0 }}>
            {initial?.id ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Título do produto" value={form.title} onChange={e => set('title', e.target.value)} />
          <Input as="textarea" label="Descrição" rows={3} value={form.description}
            onChange={e => set('description', e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, display: 'block', marginBottom: 6 }}>Tipo</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderSubtle}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, display: 'block', marginBottom: 6 }}>Modelo de acesso</label>
              <select value={form.access_type} onChange={e => set('access_type', e.target.value)}
                style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.borderSubtle}`, borderRadius: 10, color: C.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                {Object.entries(ACCESS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Preço (R$)" type="number" value={String(form.price ?? '')}
              onChange={e => set('price', parseFloat(e.target.value) || 0)} />
            <Input label="Preço original (R$)" type="number"
              value={String(form.price_old ?? '')}
              onChange={e => set('price_old', parseFloat(e.target.value) || undefined)} />
          </div>

          {/* Status toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button"
              onClick={() => set('is_active', !form.is_active)}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: form.is_active ? '#E10600' : C.borderSubtle,
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s',
              }}>
              <span style={{
                position: 'absolute', top: 3,
                left: form.is_active ? 20 : 4,
                width: 16, height: 16, borderRadius: '50%',
                background: form.is_active ? '#000' : C.textDim,
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              Produto {form.is_active ? 'ativo' : 'inativo'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={() => onSave(form)}>
              {initial?.id ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function OwnerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'new' | Product>(null)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | ProductType>('all')

  useEffect(() => {
    async function load() {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) throw error
          setProducts((data as Product[]) ?? [])
        } else if (USE_MOCK_DATA) {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (err) {
        console.error('[OwnerProducts]', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = products.filter(p => typeFilter === 'all' || p.type === typeFilter)

  async function handleSave(data: Partial<Product>) {
    if (!data.title) return
    if (modal === 'new') {
      const newProd: Product = {
        id: Math.random().toString(36).slice(2),
        title: data.title!, description: data.description ?? '',
        type: data.type ?? 'course', access_type: data.access_type ?? 'paid_once',
        price: data.price ?? 0, price_old: data.price_old,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
      }
      setProducts(p => [newProd, ...p])
      if (supabase) await supabase.from('products').insert(newProd)
    } else {
      const updated = { ...(modal as Product), ...data }
      setProducts(p => p.map(x => x.id === updated.id ? updated : x))
      if (supabase) await supabase.from('products').update(data).eq('id', updated.id)
    }
    setModal(null)
  }

  async function toggleActive(product: Product) {
    const updated = { ...product, is_active: !product.is_active }
    setProducts(p => p.map(x => x.id === product.id ? updated : x))
    if (supabase) await supabase.from('products').update({ is_active: updated.is_active }).eq('id', product.id)
  }

  async function deleteProduct(id: string) {
    setProducts(p => p.filter(x => x.id !== id))
    if (supabase) await supabase.from('products').delete().eq('id', id)
  }

  const totalActive = products.filter(p => p.is_active).length
  const monthlyRevPotential = products.filter(p => p.is_active && p.type === 'subscription').reduce((s, p) => s + p.price, 0)

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 960 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>Produtos</h1>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                {totalActive} produtos ativos · Gerencie cursos, assinaturas, ebooks e bundles
              </p>
            </div>
            <Button variant="primary" onClick={() => setModal('new')} icon={<Icons.Plus size={14} />}>
              Novo produto
            </Button>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Produtos ativos', value: String(totalActive), icon: '✅' },
              { label: 'Cursos', value: String(products.filter(p => p.type === 'course').length), icon: '🎓' },
              { label: 'Assinaturas', value: String(products.filter(p => p.type === 'subscription').length), icon: '♻️' },
              { label: 'Potencial recorrente', value: formatBRL(monthlyRevPotential) + '/mês', icon: '💰' },
            ].map(k => (
              <Card key={k.label} style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 2 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Type filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['all', 'course', 'subscription', 'ebook', 'bundle'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${typeFilter === t ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                background: typeFilter === t ? 'rgba(225,6,0,0.12)' : 'transparent',
                color: typeFilter === t ? '#E10600' : C.textMuted,
                fontWeight: typeFilter === t ? 600 : 400,
              }}>
                {t === 'all' ? 'Todos' : `${TYPE_EMOJI[t as ProductType]} ${TYPE_LABELS[t as ProductType]}`}
              </button>
            ))}
          </div>

          {/* Products table */}
          {loading ? <SkeletonList rows={4} /> : <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                    {['Produto', 'Tipo', 'Acesso', 'Preço', 'Status', 'Ações'].map(h => (
                      <th key={h} style={{
                        padding: '14px 20px', textAlign: 'left', fontSize: 12,
                        color: C.textMuted, fontWeight: 600, letterSpacing: '0.04em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => (
                    <tr key={product.id}
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{product.title}</div>
                        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.description}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <Badge variant="muted">{TYPE_EMOJI[product.type]} {TYPE_LABELS[product.type]}</Badge>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: 13, color: C.textMuted }}>{ACCESS_LABELS[product.access_type]}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#E10600' }}>
                          {formatBRL(product.price)}
                          {product.type === 'subscription' && <span style={{ fontSize: 11, color: C.textDim }}>/mês</span>}
                        </div>
                        {product.price_old && (
                          <div style={{ fontSize: 11, color: C.textDim, textDecoration: 'line-through' }}>
                            {formatBRL(product.price_old)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button onClick={() => toggleActive(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Badge variant={product.is_active ? 'success' : 'muted'}>
                            {product.is_active ? '● Ativo' : '○ Inativo'}
                          </Badge>
                        </button>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Button variant="outline" size="sm" onClick={() => setModal(product)}
                            icon={<Icons.Edit size={12} />}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm"
                            style={{ color: C.danger }}
                            onClick={() => setConfirmDelete(product)}
                            icon={<Icons.Trash size={12} />}>
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                  <p>Nenhum produto encontrado.</p>
                </div>
              )}
            </div>
          </Card>}

          {/* Info box ASA */}
          <div style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 10,
            background: 'rgba(225,6,0,0.06)', border: `1px solid ${'rgba(225,6,0,0.4)'}`,
            fontSize: 13, color: C.textMuted,
          }}>
            <strong style={{ color: '#E10600' }}>💡 Integração ASA:</strong>{' '}
            Para ativar o checkout real (PIX, cartão, boleto), configure sua chave API em{' '}
            <strong>Configurações → Integração ASA</strong> e certifique-se que a Edge Function
            de webhook está publicada no Supabase.
          </div>
        </div>
      </FadeIn>

      {modal !== null && (
        <ProductForm
          initial={modal === 'new' ? undefined : (modal as Product)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Remover produto"
        message={`Deseja remover "${confirmDelete?.title}"? Os acessos existentes não serão revogados.`}
        confirmLabel="Remover"
        onConfirm={() => { if (confirmDelete) deleteProduct(confirmDelete.id) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageLayout>
  )
}
