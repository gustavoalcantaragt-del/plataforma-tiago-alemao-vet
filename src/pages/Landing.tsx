import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { C } from '../lib/theme'
import { CheckoutModal } from '../components/checkout/CheckoutModal'
import type { Course } from '../types'

// Pseudo-course objects used when showing CheckoutModal from the landing pricing section
const PLAN_MENSAL: Course = {
  id: 'plan-mensal', title: 'Plataforma Tiago Alemão VET — Plano Mensal',
  subtitle: 'Acesso completo por 1 mês', description: '', category: 'Assinatura',
  emoji: '📅', thumbnail_gradient: 'linear-gradient(135deg,#E10600,#7c0300)',
  price: 97, price_old: 0, modules_count: 0, lessons_count: 0,
  hours: 0, students_count: 0, rating: 5, is_published: true,
  created_at: '', owner_id: '',
}
const PLAN_ANUAL: Course = {
  id: 'plan-anual', title: 'Plataforma Tiago Alemão VET — Plano Anual',
  subtitle: 'Acesso completo por 12 meses', description: '', category: 'Assinatura',
  emoji: '🏆', thumbnail_gradient: 'linear-gradient(135deg,#E10600,#f59e0b)',
  price: 797, price_old: 1164, modules_count: 0, lessons_count: 0,
  hours: 0, students_count: 0, rating: 5, is_published: true,
  created_at: '', owner_id: '',
}

const RED = C.red           // #E10600
const DARK = '#111111'
const TEXT = '#111111'
const MUTED = '#666666'
const BG = '#FFFFFF'
const LIGHT_BG = '#F5F5F5'

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid #E5E7EB',
      padding: '20px 0',
    }}>
      <style>{`
        @keyframes faq-open {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          fontSize: 16, fontWeight: 600, color: TEXT, fontFamily: 'inherit', gap: 16,
          transition: 'color 0.2s',
        }}
      >
        <span style={{ color: open ? RED : TEXT, transition: 'color 0.2s' }}>{q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: open ? RED : '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#fff' : '#6B7280',
          fontSize: 18, lineHeight: 1, transition: 'all 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </button>
      {open && (
        <p style={{
          margin: '12px 0 0', fontSize: 15, color: MUTED, lineHeight: 1.7,
          animation: 'faq-open 0.2s ease',
        }}>{a}</p>
      )}
    </div>
  )
}

// ─── Main Landing ──────────────────────────────────────────────────────────────
export function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<Course | null>(null)

  function goToApp() {
    navigate(user ? '/dashboard' : '/login')
  }

  function openPlan(plan: Course) {
    if (user) {
      setCheckoutPlan(plan)
    } else {
      navigate('/cadastro')
    }
  }

  const sectionStyle: React.CSSProperties = {
    padding: '80px 24px',
    maxWidth: 1100,
    margin: '0 auto',
  }

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Inter', 'Outfit', sans-serif", overflowX: 'hidden' }}>
      {checkoutPlan && (
        <CheckoutModal
          course={checkoutPlan}
          productId={checkoutPlan.id}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => { setCheckoutPlan(null); navigate('/dashboard') }}
        />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: RED,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: '#fff',
            }}>T</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
              Tiago Alemão <span style={{ color: RED }}>VET</span>
            </span>
          </div>

          {/* Nav desktop */}
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="landing-nav-desktop">
            {['Método', 'Plataforma', 'Planos', 'Depoimentos'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                fontSize: 14, fontWeight: 500, color: MUTED,
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                {item}
              </a>
            ))}
            <button
              onClick={goToApp}
              style={{
                background: RED, color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              {user ? 'Minha conta' : 'Começar agora'}
            </button>
          </nav>

          {/* Hamburguer mobile */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="landing-nav-mobile-btn"
            style={{
              display: 'none', background: 'none', border: 'none',
              cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5,
            }}
            aria-label="Menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2,
                background: TEXT, borderRadius: 2,
                transition: 'all 0.2s',
                transform: mobileOpen
                  ? i === 0 ? 'rotate(45deg) translate(5px, 5px)'
                  : i === 2 ? 'rotate(-45deg) translate(5px, -5px)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: mobileOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div style={{
            background: 'rgba(255,255,255,0.98)', borderTop: '1px solid #E5E7EB',
            padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
            animation: 'faq-open 0.15s ease',
          }}>
            {['Método', 'Plataforma', 'Planos', 'Depoimentos'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 16, fontWeight: 600, color: TEXT, textDecoration: 'none' }}
              >
                {item}
              </a>
            ))}
            <button onClick={() => { setMobileOpen(false); goToApp() }} style={{
              background: RED, color: '#fff', border: 'none', borderRadius: 8,
              padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              {user ? 'Minha conta' : 'Começar agora'}
            </button>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-mobile-btn { display: flex !important; }
        }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 100%)',
        paddingTop: 80,
      }}>
        <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Text */}
          <div>
            {/* Badge pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(225,6,0,0.08)', color: RED,
              borderRadius: 9999, padding: '6px 16px',
              fontSize: 13, fontWeight: 600, marginBottom: 24,
              border: '1px solid rgba(225,6,0,0.2)',
            }}>
              Plataforma exclusiva para veterinários
            </span>

            <h1 style={{
              fontSize: 44, fontWeight: 800, color: TEXT,
              lineHeight: 1.15, margin: '0 0 20px',
            }}>
              Gestão financeira para clínicas veterinárias com{' '}
              <span style={{ color: RED }}>lucro previsível</span>
            </h1>

            <p style={{
              fontSize: 18, color: MUTED, lineHeight: 1.7,
              margin: '0 0 36px', maxWidth: 480,
            }}>
              Formações, mentorias e ferramentas práticas para médicos veterinários que querem crescer com estrutura e previsibilidade financeira.
            </p>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={goToApp}
                style={{
                  background: RED, color: '#fff', border: 'none',
                  borderRadius: 10, padding: '16px 32px',
                  fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(225,6,0,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
              >
                Acessar a plataforma
              </button>
              <a href="#metodo" style={{
                fontSize: 15, color: MUTED, textDecoration: 'none',
                fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Ver como funciona →
              </a>
            </div>
          </div>

          {/* Platform mockup */}
          <div style={{
            background: '#111111', borderRadius: 16,
            padding: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            {/* Mock sidebar + content */}
            <div style={{ display: 'flex', gap: 16, height: 340 }}>
              {/* Sidebar */}
              <div style={{
                width: 56, background: '#1A1A1A', borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 8px', gap: 12,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>T</div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i === 0 ? 'rgba(225,6,0,0.15)' : 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[RED, '#16A34A', '#F59E0B'].map((c, i) => (
                    <div key={i} style={{ height: 70, background: `${c}18`, borderRadius: 8, border: `1px solid ${c}30` }} />
                  ))}
                </div>
                <div style={{ height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />
                  <div style={{ height: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DORES ──────────────────────────────────────────────────────────── */}
      <section style={{ background: LIGHT_BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px' }}>
            Por que clínicas veterinárias não crescem?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { icon: '📊', title: 'Precificação no achismo', desc: 'Sem método de cálculo real de custos, os serviços são precificados abaixo do necessário para gerar lucro.' },
              { icon: '💸', title: 'Fluxo de caixa sem controle', desc: 'Não sabe quanto vai entrar ou sair no próximo mês. O dinheiro some sem explicação clara.' },
              { icon: '📈', title: 'Crescimento sem estrutura', desc: 'Receita cresce, mas lucro não acompanha. Mais trabalho, mais despesas, mesma margem.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: BG, borderRadius: 14, padding: 32,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                textAlign: 'left', borderTop: `4px solid ${RED}`,
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÉTODO ─────────────────────────────────────────────────────────── */}
      <section id="metodo" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block', background: 'rgba(225,6,0,0.08)',
              color: RED, borderRadius: 9999, padding: '6px 16px',
              fontSize: 13, fontWeight: 600, marginBottom: 16,
              border: '1px solid rgba(225,6,0,0.2)',
            }}>
              O Método Tiago Alemão
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: 0 }}>
              Diagnóstico. Organização. Crescimento.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            {[
              { n: '01', title: 'Diagnóstico financeiro completo', desc: 'Entenda onde o dinheiro está indo e qual é a real situação da sua clínica.' },
              { n: '02', title: 'Organização de custos e precificação', desc: 'Aprenda a calcular o custo real de cada serviço e precificar com margem de lucro.' },
              { n: '03', title: 'Indicadores de performance (KPIs)', desc: 'Defina e monitore os indicadores que realmente importam para o crescimento do negócio.' },
              { n: '04', title: 'Fluxo de caixa previsível', desc: 'Construa uma visão clara do futuro financeiro da sua clínica para tomar decisões com segurança.' },
              { n: '05', title: 'Escala sustentável', desc: 'Com a base estruturada, cresça com consistência sem sacrificar a margem de lucro.' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 24, alignItems: 'flex-start',
                background: BG, borderRadius: 12, padding: 24,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                  background: RED, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATAFORMA ─────────────────────────────────────────────────────── */}
      <section id="plataforma" style={{ background: LIGHT_BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px' }}>
            Tudo que você precisa em um lugar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: '🎓', title: 'Formações', desc: 'Módulos completos de gestão financeira veterinária, do zero ao avançado.' },
              { icon: '📊', title: 'Planilhas', desc: 'Ferramentas práticas prontas para usar no dia a dia da sua clínica.' },
              { icon: '🎙️', title: 'Mentorias', desc: 'Sessões ao vivo e gravadas com Tiago Alemão e convidados especializados.' },
              { icon: '💬', title: 'Comunidade', desc: 'Troca de experiências com colegas veterinários e gestores do Brasil inteiro.' },
              { icon: '🏆', title: 'Certificados', desc: 'Valide seu conhecimento com certificados de conclusão emitidos pela plataforma.' },
              { icon: '🛠️', title: 'Suporte', desc: 'Atendimento direto com a equipe para tirar dúvidas e resolver problemas.' },
            ].map((item, i) => (
              <div key={i} style={{
                background: BG, borderRadius: 12, padding: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB', textAlign: 'left',
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px' }}>
            Para quem é a plataforma
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '🩺', label: 'Médicos veterinários' },
              { icon: '🏥', label: 'Clínicas e hospitais' },
              { icon: '🐾', label: 'Pet shops' },
              { icon: '📋', label: 'Gestores financeiros do setor' },
            ].map((item, i) => (
              <div key={i} style={{
                background: LIGHT_BG, borderRadius: 12, padding: '28px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                border: '1px solid #E5E7EB',
              }}>
                <div style={{ fontSize: 36 }}>{item.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRILHA ─────────────────────────────────────────────────────────── */}
      <section style={{ background: DARK, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#FFFFFF', margin: '0 0 48px', textAlign: 'center' }}>
            Trilha de formação completa
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[
              'Fundamentos de gestão financeira veterinária',
              'Diagnóstico financeiro da sua clínica',
              'Precificação estratégica de serviços',
              'Controle de custos e despesas',
              'Indicadores de desempenho (KPIs)',
              'Planejamento e crescimento sustentável',
            ].map((module, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: '#1A1A1A', borderRadius: 10, padding: '18px 20px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: RED, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{module}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 20px' }}>
            Quem é Tiago Alemão
          </h2>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.8, margin: '0 0 48px', maxWidth: 680, marginLeft: 'auto', marginRight: 'auto' }}>
            Consultor e mentor com mais de 15 anos de experiência em gestão financeira para o setor veterinário. Já ajudou centenas de clínicas e pet shops a saírem do improviso e construírem negócios financeiramente sólidos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { value: '200+', label: 'clínicas atendidas' },
              { value: '15+', label: 'anos de experiência' },
              { value: 'R$ 50M+', label: 'em receita otimizada' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: RED, marginBottom: 8 }}>{stat.value}</div>
                <div style={{ fontSize: 15, color: MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────────── */}
      <section id="depoimentos" style={{ background: LIGHT_BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px' }}>
            O que dizem nossos alunos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                text: 'Depois do método do Tiago, consegui aumentar minha margem em 40% sem aumentar o faturamento. Só organizando o que já existia.',
                name: 'Dra. Fernanda Oliveira',
                role: 'Proprietária de clínica veterinária, SP',
              },
              {
                text: 'Finalmente entendi por que meu pet shop faturava bem mas nunca sobrava dinheiro. As planilhas e o método mudaram minha visão de negócio.',
                name: 'Carlos Henrique Matos',
                role: 'Gestor de pet shop, MG',
              },
              {
                text: 'A formação em precificação foi um divisor de águas. Hoje cobro o que meu trabalho vale e meus clientes continuam chegando.',
                name: 'Dr. Rodrigo Vasconcelos',
                role: 'Médico veterinário autônomo, RJ',
              },
            ].map((dep, i) => (
              <div key={i} style={{
                background: BG, borderRadius: 14, padding: 28,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB', textAlign: 'left',
              }}>
                <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
                  "{dep.text}"
                </p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{dep.name}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{dep.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ─────────────────────────────────────────────────────────── */}
      <section id="planos" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px' }}>
            Escolha seu plano
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Mensal */}
            <div style={{
              background: BG, borderRadius: 16, padding: 32,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>Mensal</h3>
              <div style={{ fontSize: 40, fontWeight: 900, color: TEXT, margin: '16px 0 4px' }}>
                R$ 97<span style={{ fontSize: 16, fontWeight: 400, color: MUTED }}>/mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', textAlign: 'left' }}>
                {['Acesso completo', 'Formações em vídeo', 'Planilhas práticas', 'Comunidade'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: TEXT }}>
                    <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => openPlan(PLAN_MENSAL)} style={{
                width: '100%', background: 'transparent', color: RED,
                border: `2px solid ${RED}`, borderRadius: 10,
                padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = RED; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = RED }}
              >
                Começar agora
              </button>
            </div>

            {/* Anual */}
            <div style={{
              background: RED, borderRadius: 16, padding: 32,
              boxShadow: '0 8px 32px rgba(225,6,0,0.25)',
              position: 'relative',
            }}>
              {/* Badge */}
              <span style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: '#F59E0B', color: '#111', borderRadius: 9999,
                padding: '4px 16px', fontSize: 12, fontWeight: 800,
                whiteSpace: 'nowrap',
              }}>
                ⭐ Mais popular
              </span>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Anual</h3>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '16px 0 4px' }}>
                R$ 797<span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>/ano</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
                equivale a R$ 66/mês
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' }}>
                {['Tudo do plano mensal', 'Mentorias em grupo', 'Certificados de conclusão', 'Suporte prioritário'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: '#fff' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => openPlan(PLAN_ANUAL)} style={{
                width: '100%', background: '#fff', color: RED,
                border: 'none', borderRadius: 10,
                padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                Começar agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ background: LIGHT_BG, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: TEXT, margin: '0 0 48px', textAlign: 'center' }}>
            Perguntas frequentes
          </h2>
          <div style={{ background: BG, borderRadius: 14, padding: '8px 24px', border: '1px solid #E5E7EB' }}>
            <FaqItem
              q="Preciso ter conhecimento financeiro prévio?"
              a="Não. A formação começa do zero e evolui de forma progressiva. Você não precisa ter nenhum conhecimento prévio em finanças para começar."
            />
            <FaqItem
              q="Como funciona o acesso?"
              a="Após a confirmação do pagamento, o acesso é liberado imediatamente. Você acessa a plataforma pelo computador ou celular a qualquer hora."
            />
            <FaqItem
              q="Tem suporte?"
              a="Sim! Você conta com suporte via comunidade e atendimento direto com a equipe para tirar dúvidas sobre o conteúdo e a plataforma."
            />
            <FaqItem
              q="Posso cancelar a qualquer momento?"
              a="Sim, sem multa. No plano mensal você cancela quando quiser. No plano anual, o acesso permanece até o fim do período pago."
            />
            <FaqItem
              q="Os certificados são reconhecidos?"
              a="São certificados de conclusão emitidos pela plataforma Tiago Alemão VET, que comprovam sua participação e conclusão dos módulos."
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0B0B0B', padding: '64px 24px 32px', color: '#555' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Top grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48, flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff' }}>T</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Tiago Alemão <span style={{ color: RED }}>VET</span></span>
              </div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 260 }}>
                A plataforma de educação veterinária para médicos, gestores e donos de pet shop que querem crescer de verdade.
              </p>
              {/* Social */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { icon: '📸', label: 'Instagram', href: '#' },
                  { icon: '▶', label: 'YouTube', href: '#' },
                  { icon: '💼', label: 'LinkedIn', href: '#' },
                  { icon: '💬', label: 'WhatsApp', href: '#' },
                ].map(s => (
                  <a key={s.label} href={s.href} title={s.label} style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, textDecoration: 'none', transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,6,0,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Plataforma */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Plataforma</div>
              {['Cursos', 'Mentorias', 'Comunidade', 'Certificados', 'Trilha de carreira'].map(item => (
                <a key={item} href="#" style={{ display: 'block', fontSize: 13, color: '#555', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >{item}</a>
              ))}
            </div>

            {/* Suporte */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Suporte</div>
              {['Central de ajuda', 'Fale conosco', 'Status da plataforma'].map(item => (
                <a key={item} href="#" style={{ display: 'block', fontSize: 13, color: '#555', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >{item}</a>
              ))}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: '#444', marginBottom: 4 }}>E-mail</div>
                <a href="mailto:contato@tiagoedu.com.br" style={{ fontSize: 13, color: RED, textDecoration: 'none' }}>
                  contato@tiagoedu.com.br
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Legal</div>
              {['Política de privacidade', 'Termos de uso', 'Política de cookies', 'LGPD'].map(item => (
                <a key={item} href="#" style={{ display: 'block', fontSize: 13, color: '#555', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >{item}</a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 12, color: '#333' }}>
              © {new Date().getFullYear()} Tiago Alemão VET. Todos os direitos reservados.
            </div>
            <div style={{ fontSize: 12, color: '#333' }}>
              🔒 Pagamentos processados com segurança pela <span style={{ color: '#555' }}>Asaas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
