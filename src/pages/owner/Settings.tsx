import { useState } from 'react'
import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageLayout } from '../../components/layout/PageLayout'

export function OwnerSettings() {
  const [platformName, setPlatformName] = useState('Plataforma Tiago Alemão VET')
  const [supportEmail, setSupportEmail] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontWeight: 700, fontSize: 26, color: C.text, margin: '0 0 4px' }}>Configurações</h1>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Personalize sua plataforma</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Geral */}
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 18px' }}>Informações gerais</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="Nome da plataforma" value={platformName} onChange={e => setPlatformName(e.target.value)} />
                <Input label="E-mail de suporte" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} placeholder="suporte@suaplataforma.com.br" />
              </div>
            </Card>

            {/* Domínio */}
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Domínio personalizado</h3>
              <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 16px' }}>
                Configure um domínio próprio para sua plataforma (ex: app.seudominio.com.br)
              </p>
              <Input label="Domínio" placeholder="app.seudominio.com.br" />
            </Card>

            {/* Integrações */}
            <Card>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Integração ASA (Asaas)</h3>
              <p style={{ fontSize: 13, color: C.textMuted, margin: '0 0 16px' }}>
                Insira sua chave de API para ativar pagamentos PIX, cartão e assinaturas recorrentes.
              </p>
              <Input label="Chave API ASA" placeholder="$aact_..." type="password" />
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {saved && <span style={{ color: C.success, fontSize: 13, alignSelf: 'center' }}>✓ Configurações salvas!</span>}
              <Button variant="primary" onClick={save}>Salvar configurações</Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </PageLayout>
  )
}
