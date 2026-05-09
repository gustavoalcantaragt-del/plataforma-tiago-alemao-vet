import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { Icons } from '../icons'
import { useNotifications, timeAgo } from '../../hooks/useNotifications'
import type { NotificationType } from '../../hooks/useNotifications'

const TYPE_ICONS: Record<NotificationType, string> = {
  achievement: '🏆',
  course:      '🎓',
  event:       '📡',
  payment:     '💳',
  system:      '🔔',
}

interface NotificationBellProps {
  expanded?: boolean  // sidebar expanded state — if true, show label
}

export function NotificationBell({ expanded }: NotificationBellProps) {
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notificações"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '9px 18px', margin: '0 8px', marginLeft: 0, borderRadius: 10,
          background: open ? 'rgba(225,6,0,0.08)' : 'transparent',
          border: 'none', cursor: 'pointer', transition: 'background 0.15s',
          color: open ? '#E10600' : C.textMuted, fontFamily: 'inherit',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Icons.Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: C.danger, color: '#fff',
              fontSize: 9, fontWeight: 800,
              borderRadius: '50%', width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${C.bgCard}`,
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {expanded && (
          <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
            Notificações
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'fixed', left: 76, top: 'auto',
          marginTop: -200,
          width: 340, background: C.bgCard,
          border: `1px solid ${C.borderSubtle}`,
          borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          zIndex: 9999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${C.borderSubtle}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              Notificações
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8, background: C.danger, color: '#fff',
                  fontSize: 10, fontWeight: 800, borderRadius: 9999,
                  padding: '1px 6px',
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: '#E10600', fontFamily: 'inherit',
              }}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
                Nenhuma notificação
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markRead(n.id)
                    if (n.action_url) { navigate(n.action_url); setOpen(false) }
                  }}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    borderBottom: `1px solid ${C.borderSubtle}`,
                    background: n.is_read ? 'transparent' : 'rgba(225,6,0,0.04)',
                    cursor: n.action_url ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.is_read ? 'transparent' : 'rgba(225,6,0,0.04)'}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    {TYPE_ICONS[n.type]}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: C.text, lineHeight: 1.3 }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: C.textDim, flexShrink: 0 }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
                      {n.body}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#E10600', flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
