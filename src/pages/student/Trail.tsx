import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { MOCK_TRAIL_STAGES } from '../../data/mock'

export function StudentTrail() {
  const navigate = useNavigate()
  const total = MOCK_TRAIL_STAGES.length
  const done = MOCK_TRAIL_STAGES.filter(s => s.status === 'done').length
  const current = MOCK_TRAIL_STAGES.findIndex(s => s.status === 'current')
  const progress = Math.round((done / total) * 100)

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>
            Sua Trilha de Aprendizado
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Complete cada etapa para desbloquear a próxima e receber seu certificado final.
          </p>
        </div>

        {/* Progress bar */}
        <Card style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: C.textMuted }}>Progresso geral</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#E10600' }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: '#E10600',
              borderRadius: 9999, transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: C.textDim }}>
            <span>{done} etapas concluídas</span>
            <span>{total - done} restantes</span>
          </div>
        </Card>
      </FadeIn>

      {/* Trail stages */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 27, top: 28, bottom: 28,
          width: 2, background: C.borderSubtle, zIndex: 0,
        }} />

        {MOCK_TRAIL_STAGES.map((stage, i) => {
          const isDone = stage.status === 'done'
          const isCurrent = stage.status === 'current'
          const isLocked = stage.status === 'locked'

          return (
            <FadeIn key={stage.id} delay={i * 80}>
              <div style={{ display: 'flex', gap: 20, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                {/* Node */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: isDone ? C.success : isCurrent ? '#E10600' : C.bgElevated,
                    border: `3px solid ${isDone ? C.success : isCurrent ? '#E10600' : C.borderSubtle}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: isCurrent ? `0 0 20px rgba(225,6,0,0.4)` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isDone ? <Icons.Check size={22} color="#000" /> : isLocked ? <Icons.Lock size={20} color={C.textDim} /> : stage.emoji}
                  </div>
                  {/* Current pulse */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', width: 56, height: 56, borderRadius: '50%',
                      border: `2px solid ${'#E10600'}`, top: 0, left: 0,
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                  )}
                  <style>{`
                    @keyframes pulse {
                      0%, 100% { opacity: 0.3; transform: scale(1); }
                      50% { opacity: 1; transform: scale(1.15); }
                    }
                  `}</style>
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <Card style={{
                    opacity: isLocked ? 0.6 : 1,
                    border: `1px solid ${isCurrent ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
                    boxShadow: isCurrent ? `0 0 20px rgba(225,6,0,0.1)` : undefined,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: C.textDim }}>Etapa {i + 1}</span>
                          <Badge variant={isDone ? 'success' : isCurrent ? 'primary' : 'muted'}>
                            {isDone ? 'Concluído' : isCurrent ? 'Em progresso' : 'Bloqueado'}
                          </Badge>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: isDone ? C.textMuted : C.text, margin: 0 }}>
                          {stage.emoji} {stage.id === current.toString() ? '' : ''}{MOCK_TRAIL_STAGES[i].title}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {isDone && (
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/curso/${stage.id}`)} icon={<Icons.Eye size={14} />}>
                            Revisar
                          </Button>
                        )}
                        {isCurrent && (
                          <Button variant="primary" size="sm" onClick={() => navigate(`/curso/${stage.id}`)} icon={<Icons.Play size={14} />}>
                            Continuar
                          </Button>
                        )}
                        {isLocked && (
                          <Button variant="ghost" size="sm" disabled icon={<Icons.Lock size={14} />}>
                            Bloqueado
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </FadeIn>
          )
        })}
      </div>
    </PageLayout>
  )
}
