import { useState, useMemo } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { PageLayout } from '../../components/layout/PageLayout'
import { useCommunityAdmin, COMMUNITY_CATEGORIES } from '../../hooks/useCommunity'
import type { Post } from '../../types'

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Pin:      () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L8 10H2l5.5 5.5-2 6.5L12 18l6.5 4-2-6.5L22 10h-6L12 2z"/></svg>,
  Trash:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Tag:      () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Search:   () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter:   () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Flag:     () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Check:    () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Heart:    () => <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Message:  () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  X:        () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
}

// ─── Category config ───────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'Geral':              '#6B7280',
  'Gestão Clínica':     '#3B82F6',
  'Clínica Veterinária':'#10B981',
  'Pet Shop':           '#F59E0B',
  'Carreira':           '#8B5CF6',
  'Dúvidas':            '#EF4444',
}

// ─── Category Assign Modal ─────────────────────────────────────────────────────
function CategoryModal({
  post, onAssign, onClose,
}: { post: Post; onAssign: (cat: string) => void; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 24, minWidth: 300,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: 0 }}>Alterar Categoria</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>
            <Icons.X />
          </button>
        </div>
        <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 16px', lineHeight: 1.5 }}>
          Post de <strong style={{ color: C.text }}>{post.user?.name ?? 'Anônimo'}</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMMUNITY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { onAssign(cat); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: post.category === cat ? `${CAT_COLORS[cat]}22` : 'transparent',
                border: `1px solid ${post.category === cat ? CAT_COLORS[cat] : C.border}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: CAT_COLORS[cat] ?? '#E10600', flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, color: C.text }}>{cat}</span>
              {post.category === cat && (
                <span style={{ marginLeft: 'auto', color: CAT_COLORS[cat] }}><Icons.Check /></span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Post Row ──────────────────────────────────────────────────────────────────
function PostRow({
  post, onPin, onDelete, onCategoryClick,
}: {
  post: Post
  onPin: () => void
  onDelete: () => void
  onCategoryClick: () => void
}) {
  const catColor = CAT_COLORS[post.category] ?? '#E10600'
  const timeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
    return `${Math.floor(diff / 86400)}d atrás`
  }

  return (
    <Card style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Avatar name={post.user?.name ?? '?'} size={38} style={{ flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{post.user?.name ?? 'Anônimo'}</span>
            <span style={{ fontSize: 11, color: C.textDim }}>{timeAgo(post.created_at)}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`,
            }}>{post.category}</span>
            {post.is_pinned && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: `${'#E10600'}22`, color: '#E10600', border: `1px solid ${'#E10600'}44`,
              }}>📌 Fixado</span>
            )}
          </div>
          <p style={{
            fontSize: 13, color: C.textMuted, margin: '0 0 10px',
            lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 72, overflow: 'hidden',
          }}>{post.content}</p>

          {/* Stats + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 12, color: C.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.Heart /> {post.reactions.heart + post.reactions.clap + post.reactions.idea + post.reactions.fire}
              </span>
              <span style={{ fontSize: 12, color: C.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icons.Message /> {post.replies_count}
              </span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button
                onClick={onCategoryClick}
                title="Alterar categoria"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 6, cursor: 'pointer', color: C.textMuted, fontSize: 12,
                }}
              >
                <Icons.Tag /> Categoria
              </button>
              <button
                onClick={onPin}
                title={post.is_pinned ? 'Desafixar' : 'Fixar post'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  background: post.is_pinned ? `${'#E10600'}22` : 'transparent',
                  border: `1px solid ${post.is_pinned ? '#E10600' : C.border}`,
                  borderRadius: 6, cursor: 'pointer',
                  color: post.is_pinned ? '#E10600' : C.textMuted, fontSize: 12,
                }}
              >
                <Icons.Pin /> {post.is_pinned ? 'Desafixar' : 'Fixar'}
              </button>
              <button
                onClick={onDelete}
                title="Remover post"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                  background: 'transparent', border: `1px solid ${C.border}`,
                  borderRadius: 6, cursor: 'pointer', color: C.danger, fontSize: 12,
                }}
              >
                <Icons.Trash /> Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function OwnerCommunity() {
  const { posts, pinPost, deletePost, assignCategory } = useCommunityAdmin()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [tabFilter, setTabFilter] = useState<'all' | 'pinned'>('all')
  const [categoryModalPost, setCategoryModalPost] = useState<Post | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Post | null>(null)

  // ─── Stats per category ──────────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    return COMMUNITY_CATEGORIES.map(cat => ({
      name: cat,
      count: posts.filter(p => p.category === cat).length,
      pinned: posts.filter(p => p.category === cat && p.is_pinned).length,
      reactions: posts
        .filter(p => p.category === cat)
        .reduce((sum, p) => sum + p.reactions.heart + p.reactions.clap + p.reactions.idea + p.reactions.fire, 0),
    }))
  }, [posts])

  const totalReactions = posts.reduce(
    (sum, p) => sum + p.reactions.heart + p.reactions.clap + p.reactions.idea + p.reactions.fire, 0
  )
  const totalReplies = posts.reduce((sum, p) => sum + p.replies_count, 0)
  const pinnedCount = posts.filter(p => p.is_pinned).length

  // ─── Filtered posts ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...posts].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    if (tabFilter === 'pinned') result = result.filter(p => p.is_pinned)
    if (catFilter !== 'Todos') result = result.filter(p => p.category === catFilter)
    if (search.trim()) result = result.filter(p =>
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      (p.user?.name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    return result
  }, [posts, tabFilter, catFilter, search])

  // ─── KPI cards ───────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Posts Ativos',  value: posts.length,    color: '#E10600' },
    { label: 'Posts Fixados', value: pinnedCount,      color: '#3B82F6' },
    { label: 'Reações Total', value: totalReactions,   color: '#10B981' },
    { label: 'Respostas',     value: totalReplies,     color: '#8B5CF6' },
  ]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 960 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>
              Moderação da Comunidade
            </h1>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
              Gerencie posts, categorias e moderação do feed
            </p>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {kpis.map(k => (
              <Card key={k.label} style={{ padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>
                  {k.value}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>{k.label}</div>
              </Card>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
            {/* Left — Posts */}
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textDim }}>
                    <Icons.Search />
                  </span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por conteúdo ou autor..."
                    style={{
                      width: '100%', padding: '9px 12px 9px 36px', background: C.surfaceHover,
                      border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
                      fontSize: 13, boxSizing: 'border-box', outline: 'none',
                    }}
                  />
                </div>

                {/* Tab filters */}
                {(['all', 'pinned'] as const).map(t => (
                  <button key={t} onClick={() => setTabFilter(t)} style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: tabFilter === t ? '#E10600' : 'transparent',
                    color: tabFilter === t ? C.bg : C.textMuted,
                    border: `1px solid ${tabFilter === t ? '#E10600' : C.border}`,
                  }}>
                    {t === 'all' ? 'Todos' : '📌 Fixados'}
                  </button>
                ))}
              </div>

              {/* Category pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {['Todos', ...COMMUNITY_CATEGORIES].map(cat => {
                  const color = cat === 'Todos' ? '#E10600' : (CAT_COLORS[cat] ?? '#E10600')
                  const active = catFilter === cat
                  return (
                    <button key={cat} onClick={() => setCatFilter(cat)} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: active ? `${color}22` : 'transparent',
                      color: active ? color : C.textMuted,
                      border: `1px solid ${active ? color : C.border}`,
                    }}>
                      {cat}
                      {cat !== 'Todos' && (
                        <span style={{ marginLeft: 5, opacity: 0.7 }}>
                          {posts.filter(p => p.category === cat).length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Post list */}
              {filtered.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Nenhum post encontrado</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map((post, i) => (
                    <FadeIn key={post.id} delay={i * 0.03}>
                      <PostRow
                        post={post}
                        onPin={() => pinPost(post.id)}
                        onDelete={() => setConfirmDelete(post)}
                        onCategoryClick={() => setCategoryModalPost(post)}
                      />
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Category stats */}
              <Card>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Filter /> Categorias
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {categoryStats.map(cs => {
                    const color = CAT_COLORS[cs.name] ?? '#E10600'
                    const pct = posts.length > 0 ? Math.round((cs.count / posts.length) * 100) : 0
                    return (
                      <div key={cs.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{cs.name}</span>
                          <span style={{ fontSize: 12, color: C.textDim }}>{cs.count} posts</span>
                        </div>
                        <div style={{ height: 4, background: C.surfaceHover, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
                        </div>
                        {cs.pinned > 0 && (
                          <span style={{ fontSize: 11, color: '#E10600' }}>📌 {cs.pinned} fixado{cs.pinned > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Top engagement */}
              <Card>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔥 Top Engajamento
                </h3>
                {[...posts]
                  .sort((a, b) =>
                    (b.reactions.heart + b.reactions.clap + b.reactions.idea + b.reactions.fire + b.replies_count) -
                    (a.reactions.heart + a.reactions.clap + a.reactions.idea + a.reactions.fire + a.replies_count)
                  )
                  .slice(0, 4)
                  .map(post => {
                    const total = post.reactions.heart + post.reactions.clap + post.reactions.idea + post.reactions.fire
                    return (
                      <div key={post.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, color: C.text, fontWeight: 500, marginBottom: 2 }}>
                          {post.user?.name ?? 'Anônimo'}
                        </div>
                        <div style={{
                          fontSize: 12, color: C.textMuted, lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          marginBottom: 4,
                        }}>
                          {post.content}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: 11, color: C.textDim }}>❤️ {total}</span>
                          <span style={{ fontSize: 11, color: C.textDim }}>💬 {post.replies_count}</span>
                          <span style={{
                            marginLeft: 'auto', fontSize: 11, padding: '1px 6px', borderRadius: 8,
                            background: `${CAT_COLORS[post.category] ?? '#E10600'}22`,
                            color: CAT_COLORS[post.category] ?? '#E10600',
                          }}>{post.category}</span>
                        </div>
                      </div>
                    )
                  })}
              </Card>

              {/* Quick tips */}
              <Card style={{ background: `${'#E10600'}0A`, border: `1px solid ${'#E10600'}33` }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#E10600', margin: '0 0 10px' }}>💡 Dicas de Moderação</h3>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Fixe posts de boas-vindas e conquistas',
                    'Remova spam ou conteúdo inadequado',
                    'Mova posts para a categoria correta',
                    'Posts fixados aparecem no topo do feed',
                  ].map((tip, i) => (
                    <li key={i} style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{tip}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Category modal */}
      {categoryModalPost && (
        <CategoryModal
          post={categoryModalPost}
          onAssign={cat => assignCategory(categoryModalPost.id, cat)}
          onClose={() => setCategoryModalPost(null)}
        />
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: 28, maxWidth: 400, width: '90%',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: C.text, margin: '0 0 10px' }}>
              Remover post?
            </h3>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 6px', lineHeight: 1.6 }}>
              Post de <strong style={{ color: C.text }}>{confirmDelete.user?.name ?? 'Anônimo'}</strong>:
            </p>
            <p style={{
              fontSize: 12, color: C.textDim, margin: '0 0 22px', lineHeight: 1.5,
              padding: '8px 12px', background: C.surfaceHover, borderRadius: 6,
              maxHeight: 80, overflow: 'hidden',
            }}>
              "{confirmDelete.content}"
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button
                variant="danger"
                size="sm"
                style={{ background: C.danger, borderColor: C.danger }}
                onClick={() => { deletePost(confirmDelete.id); setConfirmDelete(null) }}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
