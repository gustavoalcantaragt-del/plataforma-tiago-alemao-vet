import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { MOCK_COURSES } from '../../data/mock'
import { USE_MOCK_DATA } from '../../lib/features'

// ─── Result types ──────────────────────────────────────────────────────────────
type ResultType = 'course' | 'page' | 'community' | 'library'

interface SearchResult {
  id: string
  type: ResultType
  title: string
  subtitle?: string
  emoji?: string
  to: string
}

// ─── Static navigation shortcuts ─────────────────────────────────────────────
const PAGES: SearchResult[] = [
  { id: 'p1', type: 'page', title: 'Início',          subtitle: 'Dashboard do aluno',            emoji: '🏠', to: '/dashboard' },
  { id: 'p2', type: 'page', title: 'Meus Cursos',     subtitle: 'Cursos matriculados',            emoji: '📚', to: '/meus-cursos' },
  { id: 'p3', type: 'page', title: 'Trilha',          subtitle: 'Trilha de aprendizado',          emoji: '🗺️', to: '/trilha' },
  { id: 'p4', type: 'page', title: 'Biblioteca',      subtitle: 'Ebooks, PDFs e materiais',      emoji: '📂', to: '/biblioteca' },
  { id: 'p5', type: 'page', title: 'Mentorias',       subtitle: 'Lives, webinars e mentorias',   emoji: '🎙️', to: '/mentorias' },
  { id: 'p6', type: 'page', title: 'Comunidade',      subtitle: 'Feed e discussões',             emoji: '💬', to: '/comunidade' },
  { id: 'p7', type: 'page', title: 'Certificados',    subtitle: 'Seus certificados emitidos',    emoji: '🏆', to: '/certificados' },
  { id: 'p8', type: 'page', title: 'Conquistas',      subtitle: 'XP, badges e níveis',           emoji: '⭐', to: '/conquistas' },
  { id: 'p9', type: 'page', title: 'Loja',            subtitle: 'Cursos disponíveis para compra',emoji: '🛍️', to: '/loja' },
  { id: 'p10',type: 'page', title: 'Perfil',          subtitle: 'Seus dados e configurações',    emoji: '👤', to: '/perfil' },
]

const TYPE_LABELS: Record<ResultType, string> = {
  course:    'Curso',
  page:      'Página',
  community: 'Comunidade',
  library:   'Biblioteca',
}

const TYPE_COLORS: Record<ResultType, string> = {
  course:    '#E10600',
  page:      '#3B82F6',
  community: '#10B981',
  library:   '#8B5CF6',
}

// ─── Search logic ──────────────────────────────────────────────────────────────
function search(query: string): SearchResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return PAGES.slice(0, 5)

  const results: SearchResult[] = []

  // Courses
  const courses = USE_MOCK_DATA ? MOCK_COURSES : []
  courses.forEach(c => {
    if (
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q)
    ) {
      results.push({
        id: `course-${c.id}`,
        type: 'course',
        title: c.title,
        subtitle: `${c.category} · ${c.lessons_count} aulas`,
        emoji: c.emoji,
        to: `/curso/${c.id}`,
      })
    }
  })

  // Pages
  PAGES.forEach(p => {
    if (
      p.title.toLowerCase().includes(q) ||
      (p.subtitle ?? '').toLowerCase().includes(q)
    ) {
      results.push(p)
    }
  })

  return results.slice(0, 8)
}

// ─── Search modal ──────────────────────────────────────────────────────────────
interface GlobalSearchModalProps { onClose: () => void }

function GlobalSearchModal({ onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = search(query)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  function goTo(to: string) {
    navigate(to)
    onClose()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIdx]) {
      goTo(results[activeIdx].to)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 3000, padding: '80px 16px 16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
          width: '100%', maxWidth: 560, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
        }}>
          <svg width="18" height="18" fill="none" stroke={C.textDim} strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Buscar cursos, páginas, conteúdos..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: C.text, fontSize: 15, fontFamily: 'inherit',
            }}
          />
          <kbd style={{
            padding: '2px 6px', fontSize: 11, color: C.textDim,
            background: C.surfaceHover, border: `1px solid ${C.border}`,
            borderRadius: 4, lineHeight: 1.6,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {!query && (
              <div style={{ padding: '10px 18px 4px', fontSize: 11, color: C.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                Atalhos rápidos
              </div>
            )}
            {results.map((r, i) => (
              <div
                key={r.id}
                onClick={() => goTo(r.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px', cursor: 'pointer',
                  background: i === activeIdx ? `rgba(225,6,0,0.08)` : 'transparent',
                  borderLeft: `2px solid ${i === activeIdx ? '#E10600' : 'transparent'}`,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {/* Emoji or icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: `${TYPE_COLORS[r.type]}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: r.emoji ? 18 : 14, color: TYPE_COLORS[r.type],
                }}>
                  {r.emoji ?? '→'}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </div>
                  {r.subtitle && (
                    <div style={{ fontSize: 12, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.subtitle}
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                  background: `${TYPE_COLORS[r.type]}1A`, color: TYPE_COLORS[r.type],
                  border: `1px solid ${TYPE_COLORS[r.type]}33`, flexShrink: 0,
                }}>
                  {TYPE_LABELS[r.type]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Nenhum resultado para "{query}"</p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '8px 18px', borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 16,
        }}>
          {[['↑↓', 'navegar'], ['Enter', 'abrir'], ['Esc', 'fechar']].map(([key, desc]) => (
            <span key={key} style={{ fontSize: 11, color: C.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ padding: '1px 5px', background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 3, fontSize: 10 }}>
                {key}
              </kbd>
              {desc}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Hook + Trigger Button ─────────────────────────────────────────────────────
export function useGlobalSearch() {
  const [open, setOpen] = useState(false)

  const openSearch = useCallback(() => setOpen(true), [])
  const closeSearch = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const SearchModal = open ? <GlobalSearchModal onClose={closeSearch} /> : null

  return { open, openSearch, closeSearch, SearchModal }
}

// ─── Search Trigger button (for Sidebar) ──────────────────────────────────────
export function SearchTriggerButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Busca global (Ctrl+K)"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: `calc(100% - 16px)`, padding: '9px 18px', margin: '0 8px',
        background: 'transparent', border: `1px solid ${C.border}`,
        borderRadius: 10, cursor: 'pointer', color: C.textDim,
        fontSize: 13, fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#E10600')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
    >
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      {expanded && (
        <>
          <span style={{ flex: 1, textAlign: 'left' }}>Buscar...</span>
          <kbd style={{ fontSize: 10, padding: '1px 5px', background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 3, color: C.textDim }}>
            ⌘K
          </kbd>
        </>
      )}
    </button>
  )
}
