import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { Icons } from '../icons'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import { useXP } from '../../hooks/useXP'
import { LevelBadge } from '../gamification/LevelBadge'
import { NotificationBell } from '../notifications/NotificationBell'
import { useGlobalSearch, SearchTriggerButton } from '../search/GlobalSearch'

interface NavItem { to: string; icon: React.ReactNode; label: string }

const STUDENT_NAV: NavItem[] = [
  { to: '/dashboard',    icon: <Icons.Home size={20} />,    label: 'Início' },
  { to: '/meus-cursos',  icon: <Icons.Book size={20} />,    label: 'Meus Cursos' },
  { to: '/trilha',       icon: <Icons.Route size={20} />,   label: 'Trilha' },
  { to: '/biblioteca',   icon: <Icons.Download size={20} />,label: 'Biblioteca' },
  { to: '/mentorias',    icon: <Icons.Zap size={20} />,     label: 'Mentorias' },
  { to: '/comunidade',   icon: <Icons.Chat size={20} />,    label: 'Comunidade' },
  { to: '/certificados', icon: <Icons.Medal size={20} />,   label: 'Certificados' },
  { to: '/conquistas',   icon: <Icons.Star size={20} />,    label: 'Conquistas' },
  { to: '/loja',         icon: <Icons.Shop size={20} />,    label: 'Loja' },
]

const OWNER_NAV: NavItem[] = [
  { to: '/admin',                icon: <Icons.BarChart size={20} />, label: 'Dashboard' },
  { to: '/admin/cursos',         icon: <Icons.Book size={20} />,     label: 'Cursos' },
  { to: '/admin/biblioteca',     icon: <Icons.Download size={20} />, label: 'Biblioteca' },
  { to: '/admin/mentorias',      icon: <Icons.Zap size={20} />,      label: 'Mentorias' },
  { to: '/admin/alunos',         icon: <Icons.Users size={20} />,    label: 'Alunos' },
  { to: '/admin/produtos',       icon: <Icons.Tag size={20} />,      label: 'Produtos' },
  { to: '/admin/pagamentos',     icon: <Icons.TrendingUp size={20} />,label: 'Pagamentos' },
  { to: '/admin/comunidade',     icon: <Icons.Chat size={20} />,       label: 'Comunidade' },
  { to: '/admin/analytics',      icon: <Icons.BarChart size={20} />,   label: 'Analytics' },
  { to: '/admin/configuracoes',  icon: <Icons.Grid size={20} />,       label: 'Configurações' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const { openSearch, SearchModal } = useGlobalSearch()

  const isOwner = user?.role === 'owner' || user?.role === 'admin'
  const navItems = isOwner ? OWNER_NAV : STUDENT_NAV

  const W = expanded ? 220 : 68

  // Only load XP for students
  const { totalXP } = useXP()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <>
    {SearchModal}
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: W, zIndex: 100,
      background: C.bgCard,
      borderRight: `1px solid rgba(255,255,255,0.06)`,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div
        onClick={() => setExpanded(e => !e)}
        title={expanded ? 'Recolher menu' : 'Expandir menu'}
        style={{
          height: 64, display: 'flex', alignItems: 'center',
          padding: '0 18px', gap: 12, cursor: 'pointer',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#E10600',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
        }}>T</div>
        {expanded && (
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            Tiago Alemão<br />
            <span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}>VET Platform</span>
          </span>
        )}
      </div>

      {/* Search trigger */}
      <div style={{ padding: '8px 8px 4px' }}>
        <SearchTriggerButton expanded={expanded} onClick={openSearch} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/admin' || item.to === '/dashboard'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 18px', margin: '0 8px', borderRadius: 10,
                  background: isActive ? 'rgba(225,6,0,0.12)' : 'transparent',
                  color: isActive ? '#E10600' : C.textMuted,
                  transition: 'all 0.15s', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ flexShrink: 0 }}>{item.icon}</div>
                {expanded && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
              </div>
            )}
          </NavLink>
        ))}

        {/* Notification bell — student only */}
        {!isOwner && (
          <div style={{ padding: '0 8px' }}>
            <NotificationBell expanded={expanded} />
          </div>
        )}
      </nav>

      {/* XP bar — student only, expanded */}
      {!isOwner && (
        <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, flexShrink: 0 }}>
          {expanded ? (
            <LevelBadge xp={totalXP} />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <LevelBadge xp={totalXP} compact />
            </div>
          )}
        </div>
      )}

      {/* Perfil link + logout */}
      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, flexShrink: 0 }}>
        {!isOwner && (
          <NavLink to="/perfil" style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: isActive ? 'rgba(225,6,0,0.08)' : 'transparent',
                transition: 'background 0.15s', cursor: 'pointer',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(225,6,0,0.08)' : 'transparent'}
              >
                <Avatar name={user?.name ?? 'U'} src={user?.avatar_url} size={36} style={{ flexShrink: 0 }} />
                {expanded && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                  </div>
                )}
              </div>
            )}
          </NavLink>
        )}

        {isOwner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
            <Avatar name={user?.name ?? 'A'} src={user?.avatar_url} size={36} style={{ flexShrink: 0 }} />
            {expanded && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: '#E10600' }}>Administrador</div>
              </div>
            )}
          </div>
        )}

        <button onClick={handleLogout} title="Sair" style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 18px', margin: '0 0 8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.textDim, fontSize: 13, fontFamily: 'inherit',
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#DC2626'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.textDim}
        >
          <Icons.LogOut size={16} style={{ flexShrink: 0 }} />
          {expanded && <span>Sair</span>}
        </button>
      </div>
    </aside>
    </>
  )
}
