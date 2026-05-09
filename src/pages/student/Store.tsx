import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { useCourses } from '../../hooks/useCourses'
import { useAllUserAccess } from '../../hooks/useUserAccess'
import { CheckoutModal } from '../../components/checkout/CheckoutModal'
import { PAYMENTS_ENABLED } from '../../lib/features'
import type { Course } from '../../types'

const CATEGORIES = ['Todos', 'Gestão Clínica', 'Clínica Veterinária', 'Pet Shop', 'Financeiro', 'Marketing', 'Carreira']

function Stars({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icons.Star key={i} size={12} color={i < Math.round(value) ? '#E10600' : C.borderSubtle} />
      ))}
      <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 4 }}>{value.toFixed(1)}</span>
    </div>
  )
}

function CourseCard({
  course,
  hasAccess,
  onBuy,
}: {
  course: Course
  hasAccess: boolean
  onBuy: (c: Course) => void
}) {
  const navigate = useNavigate()
  const discount = course.price_old
    ? Math.round((1 - course.price / course.price_old) * 100)
    : 0

  return (
    <Card hover style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
      {/* Thumb */}
      <div style={{
        height: 120, background: course.thumbnail_gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, position: 'relative',
      }}>
        {course.emoji}
        {discount > 0 && !hasAccess && (
          <Badge variant="danger" style={{ position: 'absolute', top: 10, right: 10 }}>
            -{discount}%
          </Badge>
        )}
        {hasAccess && (
          <Badge variant="success" style={{ position: 'absolute', top: 10, left: 10 }}>
            ✓ Adquirido
          </Badge>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <Badge variant="muted">{course.category}</Badge>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: '0 0 4px', lineHeight: 1.3 }}>
            {course.title}
          </h3>
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
            {course.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textDim }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icons.Grid size={12} />{course.modules_count} módulos
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icons.Book size={12} />{course.lessons_count} aulas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icons.Clock size={12} />{course.hours}h
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stars value={course.rating} />
          <span style={{ fontSize: 12, color: C.textDim }}>
            {course.students_count.toLocaleString()} alunos
          </span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {!hasAccess && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#E10600' }}>
                R$ {course.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
              {course.price_old && (
                <span style={{ fontSize: 13, color: C.textDim, textDecoration: 'line-through' }}>
                  R$ {course.price_old}
                </span>
              )}
            </div>
          )}

          {hasAccess ? (
            <Button variant="outline" size="md" fullWidth
              onClick={() => navigate(`/curso/${course.id}`)}
              icon={<Icons.Play size={14} />}>
              Continuar curso
            </Button>
          ) : PAYMENTS_ENABLED ? (
            <Button variant="primary" size="md" fullWidth
              onClick={() => onBuy(course)}
              icon={<Icons.Zap size={14} />}>
              Comprar agora
            </Button>
          ) : (
            <Button variant="outline" size="md" fullWidth disabled
              style={{ opacity: 0.55, cursor: 'not-allowed' }}>
              🔒 Em breve
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export function StudentStore() {
  const navigate = useNavigate()
  const { courses, loading } = useCourses()
  const { accessIds } = useAllUserAccess()
  const [category, setCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null)

  const filtered = courses.filter(c => {
    const matchCat = category === 'Todos' || c.category === category
    const matchSearch = !search
      || c.title.toLowerCase().includes(search.toLowerCase())
      || c.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleCheckoutSuccess() {
    setCheckoutCourse(null)
    if (checkoutCourse) navigate(`/curso/${checkoutCourse.id}`)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>
            Loja de Cursos
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Expanda seu conhecimento com os melhores cursos do mercado veterinário.
          </p>
        </div>

        {/* Banner: pagamentos em breve */}
        {!PAYMENTS_ENABLED && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px', marginBottom: 24,
            background: `${'#E10600'}10`, border: `1px solid ${'#E10600'}33`,
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🚀</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E10600', marginBottom: 2 }}>
                Vendas em breve!
              </div>
              <div style={{ fontSize: 13, color: C.textMuted }}>
                Os cursos estarão disponíveis para compra em breve. Fique atento às novidades nas redes sociais do Tiago Alemão.
              </div>
            </div>
          </div>
        )}


        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Icons.Search
            size={16}
            color={C.textMuted}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' } as React.CSSProperties}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cursos..."
            style={{
              width: '100%', padding: '12px 16px 12px 40px',
              background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
              borderRadius: 10, color: C.text, fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '6px 16px', borderRadius: 9999,
              border: `1px solid ${category === cat ? 'rgba(225,6,0,0.4)' : C.borderSubtle}`,
              background: category === cat ? 'rgba(225,6,0,0.12)' : 'transparent',
              color: category === cat ? '#E10600' : C.textMuted,
              fontSize: 13, fontWeight: category === cat ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </FadeIn>

      {loading ? (
        <SkeletonGrid cols={3} cards={6} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((c, i) => (
            <FadeIn key={c.id} delay={i * 60}>
              <CourseCard
                course={c}
                hasAccess={accessIds.includes(c.id)}
                onBuy={setCheckoutCourse}
              />
            </FadeIn>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: C.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p>Nenhum curso encontrado para "{search || category}"</p>
        </div>
      )}

      {checkoutCourse && (
        <CheckoutModal
          course={checkoutCourse}
          productId={checkoutCourse.id}
          onClose={() => setCheckoutCourse(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </PageLayout>
  )
}
