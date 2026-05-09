import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useLibraryItems } from '../../hooks/useLibrary'
import { useAllUserAccess } from '../../hooks/useUserAccess'
import type { LibraryItem, LibraryItemType } from '../../types'

const TYPE_CONFIG: Record<LibraryItemType, { icon: string; label: string }> = {
  ebook:       { icon: '📘', label: 'E-book' },
  pdf:         { icon: '📄', label: 'PDF' },
  spreadsheet: { icon: '📊', label: 'Planilha' },
  link:        { icon: '🔗', label: 'Link' },
  video:       { icon: '🎬', label: 'Vídeo' },
}

const CATEGORIES = ['Todos', 'Gestão', 'Financeiro', 'Clínica', 'Marketing', 'Vendas', 'Carreira']

function ItemCard({ item, hasAccess, onDownload }: {
  item: LibraryItem
  hasAccess: boolean
  onDownload: (item: LibraryItem) => void
}) {
  const tc = TYPE_CONFIG[item.type]
  const canDownload = item.access_type === 'free' || hasAccess

  return (
    <Card hover style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 12, flexShrink: 0,
        background: canDownload ? 'rgba(225,6,0,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${canDownload ? 'rgba(225,6,0,0.2)' : C.borderSubtle}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {tc.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: canDownload ? C.text : C.textMuted }}>
            {item.title}
          </span>
          <Badge variant={item.access_type === 'free' ? 'success' : 'primary'} style={{ fontSize: 10 }}>
            {item.access_type === 'free' ? 'Grátis' : 'Premium'}
          </Badge>
        </div>
        {item.description && (
          <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 6px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textDim }}>
          <span>{tc.label}</span>
          <span>·</span>
          <span>{item.category}</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icons.Download size={11} /> {item.download_count.toLocaleString()} downloads
          </span>
        </div>
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>
        {canDownload ? (
          <Button variant="primary" size="sm" onClick={() => onDownload(item)}
            icon={<Icons.Download size={14} />}>
            {item.type === 'link' ? 'Acessar' : item.type === 'video' ? 'Assistir' : 'Baixar'}
          </Button>
        ) : (
          <Button variant="outline" size="sm" icon={<Icons.Lock size={13} />}>
            Premium
          </Button>
        )}
      </div>
    </Card>
  )
}

export function StudentLibrary() {
  const { items, loading } = useLibraryItems()
  const { accessIds } = useAllUserAccess()
  const [category, setCategory] = useState('Todos')
  const [typeFilter, setTypeFilter] = useState<LibraryItemType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [downloadedId, setDownloadedId] = useState<string | null>(null)

  const filtered = items.filter(item => {
    const matchCat = category === 'Todos' || item.category === category
    const matchType = typeFilter === 'all' || item.type === typeFilter
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchType && matchSearch
  })

  const freeCount = filtered.filter(i => i.access_type === 'free').length
  const premiumCount = filtered.filter(i => i.access_type !== 'free').length

  function handleDownload(item: LibraryItem) {
    if (item.file_url) {
      window.open(item.file_url, '_blank')
    }
    setDownloadedId(item.id)
    setTimeout(() => setDownloadedId(null), 2000)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 900 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
              Biblioteca
            </h1>
            <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
              {freeCount} materiais grátis · {premiumCount} exclusivos premium
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Icons.Search
              size={16} color={C.textMuted}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties}
            />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar materiais..."
              style={{
                width: '100%', padding: '11px 16px 11px 40px',
                background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
                borderRadius: 10, color: C.text, fontSize: 14,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '5px 14px', borderRadius: 9999, fontSize: 13, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${category === cat ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                background: category === cat ? 'rgba(225,6,0,0.12)' : 'transparent',
                color: category === cat ? '#E10600' : C.textMuted,
                fontWeight: category === cat ? 600 : 400,
              }}>{cat}</button>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {(['all', ...Object.keys(TYPE_CONFIG)] as (LibraryItemType | 'all')[]).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${typeFilter === t ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                background: typeFilter === t ? 'rgba(225,6,0,0.08)' : 'transparent',
                color: typeFilter === t ? '#E10600' : C.textDim,
              }}>
                {t === 'all' ? 'Todos os tipos' : `${TYPE_CONFIG[t as LibraryItemType].icon} ${TYPE_CONFIG[t as LibraryItemType].label}`}
              </button>
            ))}
          </div>

          {/* Items */}
          {loading ? (
            <SkeletonList rows={6} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((item, i) => (
                <FadeIn key={item.id} delay={i * 40}>
                  <div style={{ position: 'relative' }}>
                    <ItemCard
                      item={item}
                      hasAccess={accessIds.includes(item.id)}
                      onDownload={handleDownload}
                    />
                    {downloadedId === item.id && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: C.success, color: '#000', borderRadius: 6,
                        padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      }}>
                        ✓ Baixando...
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{
              background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
              borderRadius: 16, padding: '60px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <h3 style={{ color: C.text, fontWeight: 600, fontSize: 17, margin: '0 0 8px' }}>
                Nenhum material encontrado
              </h3>
              <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
                Tente outro filtro ou busca.
              </p>
            </div>
          )}
        </div>
      </FadeIn>
    </PageLayout>
  )
}
