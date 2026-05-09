import { C } from '../../lib/theme'
import { Sidebar } from './Sidebar'
import { MobileBottomBar } from './MobileBottomBar'
import { useIsMobile } from '../../hooks/useMediaQuery'

interface PageLayoutProps {
  children: React.ReactNode
  /** Pass true to remove horizontal padding (e.g. full-width player) */
  noPadding?: boolean
}

export function PageLayout({ children, noPadding = false }: PageLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      {/* Sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 68,
        padding: noPadding ? 0 : isMobile ? '20px 16px 84px' : 32,
        maxWidth: isMobile ? '100vw' : 'calc(100vw - 68px)',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}>
        {children}
      </main>

      {/* Bottom bar — mobile only */}
      {isMobile && <MobileBottomBar />}
    </div>
  )
}
