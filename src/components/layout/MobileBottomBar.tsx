import { NavLink } from 'react-router-dom'
import { C } from '../../lib/theme'
import { Icons } from '../icons'
import { useAuth } from '../../contexts/AuthContext'
import { useGlobalSearch } from '../search/GlobalSearch'

interface BottomItem { to: string; icon: React.ReactNode; label: string }

const STUDENT_ITEMS: BottomItem[] = [
  { to: '/dashboard',   icon: <Icons.Home size={22} />,     label: 'Início' },
  { to: '/meus-cursos', icon: <Icons.Book size={22} />,     label: 'Cursos' },
  { to: '/comunidade',  icon: <Icons.Chat size={22} />,     label: 'Comunidade' },
  { to: '/mentorias',   icon: <Icons.Zap size={22} />,      label: 'Mentorias' },
  { to: '/perfil',      icon: <Icons.User size={22} />,     label: 'Perfil' },
]

const OWNER_ITEMS: BottomItem[] = [
  { to: '/admin',              icon: <Icons.BarChart size={22} />, label: 'Dashboard' },
  { to: '/admin/cursos',       icon: <Icons.Book size={22} />,     label: 'Cursos' },
  { to: '/admin/alunos',       icon: <Icons.Users size={22} />,    label: 'Alunos' },
  { to: '/admin/comunidade',   icon: <Icons.Chat size={22} />,     label: 'Comunidade' },
  { to: '/admin/configuracoes',icon: <Icons.Grid size={22} />,     label: 'Config' },
]

export function MobileBottomBar() {
  const { user } = useAuth()
  const { openSearch, SearchModal } = useGlobalSearch()
  const isOwner = user?.role === 'owner' || user?.role === 'admin'
  const items = isOwner ? OWNER_ITEMS : STUDENT_ITEMS

  return (
    <>
    {SearchModal}
    <nav
      className="mobile-bottom-bar"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: C.bgCard,
        borderTop: `1px solid ${C.borderSubtle}`,
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 8,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin' || item.to === '/dashboard'}
          style={{ flex: 1, textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, padding: '10px 4px 4px',
              color: isActive ? '#E10600' : C.textDim,
              transition: 'color 0.15s',
            }}>
              <div style={{
                padding: '4px 12px', borderRadius: 8,
                background: isActive ? `rgba(225,6,0,0.12)` : 'transparent',
                transition: 'background 0.15s',
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: '0.02em' }}>
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}

      {/* Search button */}
      <button
        onClick={openSearch}
        style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '10px 4px 4px',
          color: C.textDim,
        }}
      >
        <div style={{ padding: '4px 12px', borderRadius: 8 }}>
          <Icons.Search size={22} />
        </div>
        <span style={{ fontSize: 10, letterSpacing: '0.02em' }}>Buscar</span>
      </button>
    </nav>
    </>
  )
}
