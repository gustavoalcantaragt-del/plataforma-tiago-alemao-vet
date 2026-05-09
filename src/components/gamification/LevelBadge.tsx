import { C } from '../../lib/theme'
import { getLevelFromXP, getNextLevel, getLevelProgress, LEVELS } from '../../hooks/useXP'

interface LevelBadgeProps {
  xp: number
  compact?: boolean  // smaller version for sidebar collapsed
  style?: React.CSSProperties
}

export function LevelBadge({ xp, compact, style }: LevelBadgeProps) {
  const level = getLevelFromXP(xp)
  const next = getNextLevel(xp)
  const progress = getLevelProgress(xp)

  if (compact) {
    return (
      <div title={`${level.name} — ${xp} XP`} style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${level.color} ${progress * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', ...style,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: C.bgCard,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>
          {level.icon}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px', ...style }}>
      {/* Level row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{level.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: level.color }}>
              Nível {level.level} — {level.name}
            </span>
            <span style={{ fontSize: 11, color: C.textDim }}>{xp} XP</span>
          </div>
          {/* XP bar */}
          <div style={{
            height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, ${level.color}aa, ${level.color})`,
              borderRadius: 2, transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      </div>
      {next && (
        <div style={{ fontSize: 10, color: C.textDim, textAlign: 'right' }}>
          {next.xpRequired - xp} XP para {next.icon} {next.name}
        </div>
      )}
    </div>
  )
}

/** Full-size level card for the Achievements page */
export function LevelCard({ xp }: { xp: number }) {
  const level = getLevelFromXP(xp)
  const next = getNextLevel(xp)
  const progress = getLevelProgress(xp)

  return (
    <div style={{
      background: `linear-gradient(135deg, ${level.color}12, ${level.color}06)`,
      border: `1px solid ${level.color}30`,
      borderRadius: 16, padding: '24px 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Level circle */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${level.color} ${progress * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: C.bgCard,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            {level.icon}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: level.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Nível {level.level}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8 }}>
            {level.name}
          </div>

          {/* XP bar full */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: `linear-gradient(90deg, ${level.color}88, ${level.color})`,
                borderRadius: 4, transition: 'width 1s ease',
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.textMuted }}>
              {xp.toLocaleString()} XP total
            </span>
            {next && (
              <span style={{ color: C.textDim }}>
                {(next.xpRequired - xp).toLocaleString()} XP para {next.icon} {next.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mini level badges row showing all levels */
export function LevelsRoadmap({ currentXP }: { currentXP: number }) {
  const currentLevel = getLevelFromXP(currentXP)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', padding: '4px 0' }}>
      {LEVELS.map(lvl => {
        const unlocked = currentXP >= lvl.xpRequired
        const isCurrent = lvl.level === currentLevel.level
        return (
          <div key={lvl.level} title={`${lvl.name} (${lvl.xpRequired} XP)`} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0,
          }}>
            <div style={{
              width: isCurrent ? 44 : 36, height: isCurrent ? 44 : 36,
              borderRadius: '50%',
              background: unlocked ? `${lvl.color}20` : 'rgba(255,255,255,0.03)',
              border: `2px solid ${isCurrent ? lvl.color : unlocked ? `${lvl.color}60` : 'rgba(255,255,255,0.06)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isCurrent ? 20 : 16,
              filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)',
              transition: 'all 0.2s',
            }}>
              {lvl.icon}
            </div>
            {isCurrent && (
              <span style={{ fontSize: 9, color: lvl.color, fontWeight: 700 }}>ATUAL</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
