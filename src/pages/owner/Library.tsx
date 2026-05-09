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
import { useLibraryAdmin } from '../../hooks/useLibrary'
import type { LibraryItem, LibraryItemType } from '../../types'

const TYPE_CONFIG: Record<LibraryItemType, { icon: string; label: string }> = {
  ebook:       { icon: '📘', label: 'E-book' },
  pdf:         { icon: '📄', label: 'PDF' },
  spreadsheet: { icon: '📊', label: 'Planilha' },
  link:        { icon: '🔗', label: 'Link' },
  video:       { icon: '🎬', label: 'Vídeo' },
}

const CATEGORIES = ['Gestão', 'Financeiro', 'Clínica', 'Marketing', 'Vendas', 'Carreira', 'Outro']
const ACCESS_LABELS = { free: 'Gratuito', subscription: 'Assinantes', paid_once: 'Pago' }

// ─── Form Modal ───────────────────────────────────────────────────────────────
interface FormProps {
  initial?: Partial<LibraryItem>
  onSave: (data: Partial<LibraryItem>) => void
  onClose: () => void
}

function LibraryForm({ initial, onSave, onClose }: FormProps) {
  const [form, setForm] = useState<Partial<LibraryItem>>({
    title: '', description: '', type: 'pdf', category: 'Gestão',
    access_type: 'free', file_url: '', is_published: true,
    ...initial,
  })
  const set = (k: keyof LibraryItem, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: C.bgCard, borderRadius: 16, border: `1px solid ${C.borderSubtle}`,
        width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: C.text, margin: 0 }}>
            {initial?.id ? 'Editar material' : 'Novo material'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted }}>
            <Icons.X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Título" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Nome do material" />
          <Input as="textarea" label="Descrição" rows={3} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Descreva brevemente o conteúdo deste material..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Tipo" as="select" value={form.type}
              onChange={e => set('type', e.target.value)}>
              {Object.entries(TYPE_CONFIG).map(([v, c]) => (
                <option key={v} value={v}>{c.icon} {c.label}</option>
              ))}
            </Input>
            <Input label="Categoria" as="select" value={form.category}
              onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Input>
          </div>

          <Input label="Acesso" as="select" value={form.access_type}
            onChange={e => set('access_type', e.target.value)}>
            {Object.entries(ACCESS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Input>

          <Input
            label="URL do arquivo (Google Drive, Dropbox, S3...)"
            value={form.file_url}
            onChange={e => set('file_url', e.target.value)}
            placeholder="https://drive.google.com/file/..."
          />

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
                background: form.is_published ? '#000' : C.textDim,
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 13, color: C.textMuted }}>
              {form.is_published ? 'Publicado' : 'Rascunho'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={() => onSave(form)}>
              {initial?.id ? 'Salvar alterações' : 'Criar material'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function OwnerLibrary() {
  const { items, setItems, loading, saveItem, deleteItem } = useLibraryAdmin()
  const [modal, setModal] = useState<null | 'new' | LibraryItem>(null)
  const [confirmDelete, setConfirmDelete] = useState<LibraryItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [search, setSearch] = useState('')

  const filtered = items.filter(item => {
    const matchFilter = filter === 'all'
      || (filter === 'free' && item.access_type === 'free')
      || (filter === 'premium' && item.access_type !== 'free')
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalDownloads = items.reduce((s, i) => s + i.download_count, 0)

  async function handleSave(data: Partial<LibraryItem>) {
    if (!data.title) return
    if (modal === 'new') {
      const newItem: LibraryItem = {
        id: Math.random().toString(36).slice(2),
        title: data.title!, description: data.description ?? '',
        type: data.type ?? 'pdf', category: data.category ?? 'Gestão',
        access_type: data.access_type ?? 'free',
        file_url: data.file_url ?? '',
        download_count: 0, is_published: data.is_published ?? true,
        created_at: new Date().toISOString(),
      }
      setItems(p => [newItem, ...p])
      await saveItem(data)
    } else {
      const updated = { ...(modal as LibraryItem), ...data }
      setItems(p => p.map(x => x.id === updated.id ? updated : x))
      await saveItem(data, updated.id)
    }
    setModal(null)
  }

  async function togglePublished(item: LibraryItem) {
    const updated = { ...item, is_published: !item.is_published }
    setItems(p => p.map(x => x.id === item.id ? updated : x))
    await saveItem({ is_published: updated.is_published }, item.id)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 960 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>Biblioteca</h1>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                {items.length} materiais · {totalDownloads.toLocaleString()} downloads totais
              </p>
            </div>
            <Button variant="primary" onClick={() => setModal('new')} icon={<Icons.Plus size={14} />}>
              Novo material
            </Button>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total de materiais', value: items.length, icon: '📚' },
              { label: 'Publicados', value: items.filter(i => i.is_published).length, icon: '✅' },
              { label: 'Gratuitos', value: items.filter(i => i.access_type === 'free').length, icon: '🆓' },
              { label: 'Downloads', value: totalDownloads.toLocaleString(), icon: '⬇️' },
            ].map(k => (
              <Card key={k.label} style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{k.value}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Icons.Search size={14} color={C.textMuted}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar material..."
                style={{
                  width: '100%', padding: '9px 14px 9px 34px',
                  background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
                  borderRadius: 8, color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'free', 'premium'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                  cursor: 'pointer', border: `1px solid ${filter === f ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                  background: filter === f ? 'rgba(225,6,0,0.12)' : 'transparent',
                  color: filter === f ? '#E10600' : C.textMuted, fontWeight: filter === f ? 600 : 400,
                }}>
                  {f === 'all' ? 'Todos' : f === 'free' ? 'Grátis' : 'Premium'}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          {loading ? (
            <SkeletonList rows={5} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((item, i) => {
                const tc = TYPE_CONFIG[item.type]
                return (
                  <FadeIn key={item.id} delay={i * 40}>
                    <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(225,6,0,0.06)', border: `1px solid ${C.borderSubtle}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      }}>
                        {tc.icon}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.title}</span>
                          <Badge variant="muted" style={{ fontSize: 10 }}>{tc.label}</Badge>
                          <Badge variant={item.access_type === 'free' ? 'success' : 'primary'} style={{ fontSize: 10 }}>
                            {ACCESS_LABELS[item.access_type]}
                          </Badge>
                          {!item.is_published && (
                            <Badge variant="muted" style={{ fontSize: 10 }}>Rascunho</Badge>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: C.textDim, display: 'flex', gap: 10 }}>
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{item.download_count} downloads</span>
                          {item.file_url && <span>· 🔗 URL configurada</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => togglePublished(item)} title={item.is_published ? 'Despublicar' : 'Publicar'}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: item.is_published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${item.is_published ? 'rgba(74,222,128,0.2)' : C.borderSubtle}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          {item.is_published ? '👁' : '🙈'}
                        </button>
                        <Button variant="outline" size="sm" onClick={() => setModal(item)}
                          icon={<Icons.Edit size={12} />}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" style={{ color: C.danger }}
                          onClick={() => setConfirmDelete(item)}
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

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
              <p>Nenhum material encontrado.</p>
            </div>
          )}
        </div>
      </FadeIn>

      {modal !== null && (
        <LibraryForm
          initial={modal === 'new' ? undefined : (modal as LibraryItem)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmModal
        open={confirmDelete !== null}
        title="Remover material"
        message={`Deseja remover "${confirmDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        onConfirm={() => { if (confirmDelete) deleteItem(confirmDelete.id) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageLayout>
  )
}
