import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { C } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Icons } from '../../components/icons'
import { useAuth } from '../../contexts/AuthContext'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  // Redireciona assim que o user for setado no contexto
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    const { error } = await login(data.email, data.password)
    if (error) {
      setServerError(error === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error)
      return
    }
    // Navega imediatamente após auth suceder — não espera fetchProfile
    navigate('/dashboard', { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#E10600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28, fontWeight: 900,
            color: '#fff',
          }}>T</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Entre na plataforma do Tiago Alemão VET
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: '#111111', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 16, padding: 32,
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              register={register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Senha"
              placeholder="••••••••"
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

            {serverError && (
              <div style={{
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger,
              }}>
                {serverError}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              Entrar
            </Button>

            <div style={{ textAlign: 'right' }}>
              <Link to="/esqueci-senha" style={{ fontSize: 13, color: '#E10600', textDecoration: 'none' }}>
                Esqueci minha senha
              </Link>
            </div>
          </form>

          <div style={{
            margin: '24px 0', borderTop: `1px solid ${C.borderSubtle}`,
            paddingTop: 24, textAlign: 'center',
          }}>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
              Não tem conta?{' '}
              <Link to="/cadastro" style={{ color: '#E10600', textDecoration: 'none', fontWeight: 600 }}>
                Criar conta grátis
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
