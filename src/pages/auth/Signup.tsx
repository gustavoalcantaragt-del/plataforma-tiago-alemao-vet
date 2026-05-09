import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { C } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Icons } from '../../components/icons'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const PROFESSIONAL_ROLES = [
  { value: 'veterinario_autonomo', label: 'Médico Veterinário Autônomo' },
  { value: 'dono_clinica', label: 'Dono de Clínica Veterinária' },
  { value: 'gestor_clinica', label: 'Gestor de Clínica Veterinária' },
  { value: 'dono_petshop', label: 'Dono de Pet Shop' },
  { value: 'estudante_veterinaria', label: 'Estudante de Veterinária' },
  { value: 'outro', label: 'Outro profissional do mercado pet' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
  professional_role: z.string().optional(),
}).refine(d => d.password === d.confirm_password, {
  message: 'As senhas não coincidem',
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    const { error } = await signup(data.name, data.email, data.password)
    if (error) {
      setServerError(
        error.includes('already registered')
          ? 'Este e-mail já está cadastrado. Tente fazer login.'
          : error
      )
      return
    }

    // Salvar perfil VET se selecionado
    if (data.professional_role && supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await supabase.from('user_profiles_vet').upsert({
          user_id: session.user.id,
          professional_role: data.professional_role,
        })
      }
    }

    // Se Supabase exige confirmação de email, mostrar aviso; caso contrário, ir para dashboard
    if (supabase) {
      setEmailSent(true)
    } else {
      navigate('/dashboard')
    }
  }

  if (emailSent) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0B0B0B',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: '#111111', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 16, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <h2 style={{ color: C.text, fontWeight: 700, fontSize: 22, margin: '0 0 10px' }}>
            Confirme seu e-mail
          </h2>
          <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
            Enviamos um link de confirmação para o seu e-mail.
            Clique no link para ativar sua conta e acessar a plataforma.
          </p>
          <p style={{ color: C.textDim, fontSize: 13, margin: '0 0 24px' }}>
            Não recebeu? Verifique a caixa de spam.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: C.red, color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px 28px',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#E10600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 26, fontWeight: 900,
            color: '#fff',
          }}>T</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
            Criar sua conta
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Junte-se à plataforma do Tiago Alemão VET
          </p>
        </div>

        <div style={{
          background: '#111111', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 16, padding: 32,
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              register={register('name')}
              error={errors.name?.message}
            />
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              register={register('email')}
              error={errors.email?.message}
            />

            {/* Perfil profissional VET */}
            <div>
              <label style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Perfil profissional <span style={{ color: C.textDim, fontWeight: 400 }}>(opcional)</span>
              </label>
              <select
                {...register('professional_role')}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${C.borderSubtle}`,
                  borderRadius: 10, color: C.text,
                  fontSize: 14, fontFamily: 'inherit', outline: 'none',
                }}
              >
                <option value="">Selecione seu perfil...</option>
                {PROFESSIONAL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              type={showPass ? 'text' : 'password'}
              register={register('password')}
              error={errors.password?.message}
              rightEl={
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 0 }}>
                  {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirmar senha"
              placeholder="Repita a senha"
              type={showPass ? 'text' : 'password'}
              register={register('confirm_password')}
              error={errors.confirm_password?.message}
            />

            {serverError && (
              <div style={{
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger,
              }}>
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              Criar conta gratuitamente
            </Button>
          </form>

          <div style={{ margin: '24px 0 0', borderTop: `1px solid ${C.borderSubtle}`, paddingTop: 20, textAlign: 'center' }}>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color: '#E10600', textDecoration: 'none', fontWeight: 600 }}>
                Entrar
              </Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.textDim, marginTop: 16, lineHeight: 1.5 }}>
          Ao criar sua conta você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  )
}
