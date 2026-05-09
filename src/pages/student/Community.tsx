import { useState, useRef } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useAuth } from '../../contexts/AuthContext'
import { useCommunity, COMMUNITY_CATEGORIES } from '../../hooks/useCommunity'
import { useXP, XP_AWARDS } from '../../hooks/useXP'
import type { Post, Reply, ReactionType } from '../../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'heart', emoji: '❤️', label: 'Amei' },
  { type: 'clap',  emoji: '👏', label: 'Parabéns' },
  { type: 'idea',  emoji: '💡', label: 'Boa ideia' },
  { type: 'fire',  emoji: '🔥', label: 'Incrível' },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Geral':              '#6b7280',
  'Gestão Clínica':     '#3b82f6',
  'Clínica Veterinária':'#10b981',
  'Pet Shop':           '#f59e0b',
  'Carreira':           '#8b5cf6',
  'Dúvidas':            '#ef4444',
}

// ─── ReplyThread ─────────────────────────────────────────────────────────────
function ReplyThread({
  postId, replies, onAddReply,
}: {
  postId: string
  replies: Reply[]
  onAddReply: (postId: string, content: string) => void
}) {
  const { user } = useAuth()
  const [replyText, setReplyText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    if (!replyText.trim()) return
    onAddReply(postId, replyText)
    setReplyText('')
  }

  return (
    <div style={{
      marginTop: 12, paddingTop: 12,
      borderTop: `1px solid ${C.borderSubtle}`,
    }}>
      {/* Existing replies */}
      {replies.map(r => (
        <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Avatar name={r.user?.name ?? 'U'} size={28} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{
            flex: 1, background: C.bgElevated,
            borderRadius: 10, padding: '8px 12px',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{r.user?.name}</span>
              <span style={{ fontSize: 11, color: C.textDim }}>{timeAgo(r.created_at)}</span>
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>{r.content}</p>
          </div>
        </div>
      ))}

      {/* Reply composer */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar name={user?.name ?? 'U'} size={28} style={{ flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1 }}>
          <textarea
            ref={inputRef}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit() }}
            placeholder="Escreva uma resposta... (Ctrl+Enter para enviar)"
            rows={2}
            style={{
              width: '100%', background: C.bgElevated,
              border: `1px solid ${C.borderSubtle}`, borderRadius: 8,
              padding: '8px 12px', color: C.text, fontSize: 13,
              fontFamily: 'inherit', resize: 'none', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(225,6,0,0.4)')}
            onBlur={e => (e.target.style.borderColor = C.borderSubtle)}
          />
          {replyText && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, gap: 6 }}>
              <Button variant="ghost" size="sm" onClick={() => setReplyText('')}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={submit}>Responder</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({
  post, replies, onReact, onLoadReplies, onAddReply,
}: {
  post: Post
  replies?: Reply[]
  onReact: (id: string, r: ReactionType) => void
  onLoadReplies: (id: string) => void
  onAddReply: (postId: string, content: string) => void
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const catColor = CATEGORY_COLORS[post.category] ?? C.textMuted
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0)

  function toggleReplies() {
    if (!showReplies) onLoadReplies(post.id)
    setShowReplies(s => !s)
  }

  return (
    <Card style={{
      border: post.is_pinned ? `1px solid rgba(225,6,0,0.25)` : undefined,
      background: post.is_pinned ? 'rgba(225,6,0,0.03)' : undefined,
    }}>
      {/* Pinned indicator */}
      {post.is_pinned && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, color: '#E10600', fontWeight: 600 }}>
          <span>📌</span> Post fixado pelo admin
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
        <Avatar name={post.user?.name ?? 'U'} size={40} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{post.user?.name}</span>
            <span style={{ fontSize: 11, color: C.textDim }}>{timeAgo(post.created_at)}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
              background: `${catColor}18`, color: catColor,
            }}>{post.category}</span>
          </div>
          <p style={{ fontSize: 14, color: C.textMuted, margin: '8px 0 0', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>
        </div>
      </div>

      {/* Reaction summary row */}
      {totalReactions > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {REACTIONS.filter(r => post.reactions[r.type] > 0).map(r => (
            <button key={r.type}
              onClick={() => onReact(post.id, r.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 9999, cursor: 'pointer',
                border: `1px solid ${post.my_reaction === r.type ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                background: post.my_reaction === r.type ? 'rgba(225,6,0,0.1)' : 'transparent',
                fontSize: 12, fontFamily: 'inherit',
                color: post.my_reaction === r.type ? '#E10600' : C.textMuted,
                transition: 'all 0.15s',
              }}>
              {r.emoji} <span>{post.reactions[r.type]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 4, paddingTop: 8,
        borderTop: `1px solid ${C.borderSubtle}`,
      }}>
        {/* Reaction button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowReactionPicker(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: post.my_reaction ? '#E10600' : C.textMuted,
              fontSize: 13, fontFamily: 'inherit', padding: '6px 10px',
              borderRadius: 8, transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            {post.my_reaction
              ? REACTIONS.find(r => r.type === post.my_reaction)?.emoji
              : '🤍'
            }
            <span>{totalReactions > 0 ? totalReactions : 'Reagir'}</span>
          </button>

          {showReactionPicker && (
            <div style={{
              position: 'absolute', bottom: '110%', left: 0,
              background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
              borderRadius: 12, padding: 8, zIndex: 50,
              display: 'flex', gap: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              {REACTIONS.map(r => (
                <button key={r.type}
                  onClick={() => { onReact(post.id, r.type); setShowReactionPicker(false) }}
                  title={r.label}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: post.my_reaction === r.type ? 'rgba(225,6,0,0.15)' : 'transparent',
                    cursor: 'pointer', fontSize: 18, transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply button */}
        <button
          onClick={toggleReplies}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: showReplies ? '#E10600' : C.textMuted,
            fontSize: 13, fontFamily: 'inherit', padding: '6px 10px',
            borderRadius: 8, transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Icons.Chat size={15} />
          {post.replies_count > 0
            ? `${post.replies_count} resposta${post.replies_count !== 1 ? 's' : ''}`
            : 'Responder'
          }
        </button>
      </div>

      {/* Replies thread */}
      {showReplies && (
        <ReplyThread
          postId={post.id}
          replies={replies ?? []}
          onAddReply={onAddReply}
        />
      )}
    </Card>
  )
}

// ─── Compose box ─────────────────────────────────────────────────────────────
function ComposeBox({ onPublish }: { onPublish: (content: string, category: string) => void }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Geral')
  const [focused, setFocused] = useState(false)

  function submit() {
    if (!content.trim()) return
    onPublish(content, category)
    setContent('')
    setFocused(false)
  }

  return (
    <Card>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name={user?.name ?? 'U'} size={40} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Compartilhe algo com a comunidade VET..."
            rows={focused || content ? 4 : 2}
            style={{
              width: '100%', background: C.bgElevated,
              border: `1px solid ${focused ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
              borderRadius: 10, padding: 12, color: C.text, fontSize: 14,
              fontFamily: 'inherit', resize: 'none', outline: 'none',
              transition: 'all 0.2s',
            }}
          />

          {(focused || content) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              {/* Category picker */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COMMUNITY_CATEGORIES.map(cat => {
                  const color = CATEGORY_COLORS[cat]
                  return (
                    <button key={cat} onClick={() => setCategory(cat)} style={{
                      padding: '4px 10px', borderRadius: 9999, fontSize: 11,
                      fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                      border: `1px solid ${category === cat ? color : C.borderSubtle}`,
                      background: category === cat ? `${color}18` : 'transparent',
                      color: category === cat ? color : C.textDim,
                      transition: 'all 0.15s',
                    }}>{cat}</button>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {content && <Button variant="ghost" size="sm" onClick={() => { setContent(''); setFocused(false) }}>Cancelar</Button>}
                <Button variant="primary" size="sm" disabled={!content.trim()} onClick={submit} icon={<Icons.Zap size={14} />}>
                  Publicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function StudentCommunity() {
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const { awardXP } = useXP()
  const { posts, loading, repliesByPost, loadReplies, publishPost, react, addReply } = useCommunity(
    categoryFilter, search,
  )

  const pinned = posts.filter(p => p.is_pinned)
  const regular = posts.filter(p => !p.is_pinned)

  async function handlePublish(content: string, category: string) {
    await publishPost(content, category)
    awardXP(XP_AWARDS.community_post, 'community_post')
  }

  // Top members (computed from mock)
  const topMembers = [
    { name: 'Ana Beatriz Vet', posts: 18 },
    { name: 'Dr. Carlos Henrique', posts: 14 },
    { name: 'Dr. Roberto Santos', posts: 11 },
    { name: 'Marcos Pet Shop', posts: 9 },
  ]

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 6px' }}>
            Comunidade VET
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Conecte-se com colegas, compartilhe experiências e tire dúvidas.
          </p>
        </div>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search */}
          <FadeIn>
            <div style={{ position: 'relative' }}>
              <Icons.Search size={15} color={C.textMuted}
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar na comunidade..."
                style={{
                  width: '100%', padding: '11px 14px 11px 38px',
                  background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
                  borderRadius: 10, color: C.text, fontSize: 14,
                  fontFamily: 'inherit', outline: 'none',
                }} />
            </div>
          </FadeIn>

          {/* Category filter */}
          <FadeIn delay={50}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['Todos', ...COMMUNITY_CATEGORIES]).map(cat => {
                const color = CATEGORY_COLORS[cat] ?? '#E10600'
                const active = categoryFilter === cat
                return (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                    padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontFamily: 'inherit',
                    cursor: 'pointer', transition: 'all 0.15s', fontWeight: active ? 700 : 400,
                    border: `1px solid ${active ? color : C.borderSubtle}`,
                    background: active ? `${color}18` : 'transparent',
                    color: active ? color : C.textMuted,
                  }}>
                    {cat}
                  </button>
                )
              })}
            </div>
          </FadeIn>

          {/* Compose */}
          <FadeIn delay={80}>
            <ComposeBox onPublish={handlePublish} />
          </FadeIn>

          {loading ? (
            <SkeletonList rows={5} />
          ) : (
            <>
              {/* Pinned posts */}
              {pinned.length > 0 && pinned.map((post, i) => (
                <FadeIn key={post.id} delay={i * 50 + 100}>
                  <PostCard
                    post={post}
                    replies={repliesByPost[post.id]}
                    onReact={react}
                    onLoadReplies={loadReplies}
                    onAddReply={addReply}
                  />
                </FadeIn>
              ))}

              {/* Regular posts */}
              {regular.length === 0 && pinned.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: C.textMuted }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                  <p>Nenhum post encontrado. Seja o primeiro a publicar!</p>
                </div>
              )}
              {regular.map((post, i) => (
                <FadeIn key={post.id} delay={i * 50 + (pinned.length > 0 ? 200 : 100)}>
                  <PostCard
                    post={post}
                    replies={repliesByPost[post.id]}
                    onReact={react}
                    onLoadReplies={loadReplies}
                    onAddReply={addReply}
                  />
                </FadeIn>
              ))}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 }}>
          {/* Top members */}
          <FadeIn delay={150}>
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 14px' }}>
                🔥 Mais ativos esta semana
              </h3>
              {topMembers.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: i < topMembers.length - 1 ? `1px solid ${C.borderSubtle}` : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.textDim, width: 16 }}>{i + 1}</span>
                  <Avatar name={m.name} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>{m.posts} posts</div>
                  </div>
                  {i === 0 && <span>🥇</span>}
                  {i === 1 && <span>🥈</span>}
                  {i === 2 && <span>🥉</span>}
                </div>
              ))}
            </Card>
          </FadeIn>

          {/* Categories stats */}
          <FadeIn delay={200}>
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 12px' }}>
                Categorias
              </h3>
              {COMMUNITY_CATEGORIES.map(cat => {
                const color = CATEGORY_COLORS[cat]
                const count = posts.filter(p => p.category === cat).length
                return (
                  <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 0', borderBottom: `1px solid ${C.borderSubtle}`,
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottomColor: C.borderSubtle,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: categoryFilter === cat ? color : C.textMuted }}>{cat}</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.textDim }}>{count}</span>
                  </button>
                )
              })}
            </Card>
          </FadeIn>

          {/* Rules */}
          <FadeIn delay={250}>
            <Card style={{ background: 'rgba(225,6,0,0.04)', borderColor: 'rgba(225,6,0,0.4)' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📢</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>
                Regras da comunidade
              </h3>
              <ul style={{ fontSize: 12, color: C.textMuted, margin: 0, paddingLeft: 16, lineHeight: 2.2 }}>
                <li>Seja respeitoso com todos</li>
                <li>Sem spam ou propaganda</li>
                <li>Compartilhe conhecimento</li>
                <li>Use a categoria correta</li>
                <li>Dúvidas? Seja específico</li>
              </ul>
            </Card>
          </FadeIn>
        </div>
      </div>
    </PageLayout>
  )
}
