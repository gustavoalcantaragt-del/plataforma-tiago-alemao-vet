import { C } from '../../lib/theme'
import { FadeIn } from '../../components/ui/FadeIn'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Icons } from '../../components/icons'
import { PageLayout } from '../../components/layout/PageLayout'
import { useAuth } from '../../contexts/AuthContext'
import { MOCK_CERTIFICATES } from '../../data/mock'
import jsPDF from 'jspdf'

function generateCertificatePDF(name: string, course: string, date: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210

  // Background
  doc.setFillColor(6, 6, 10)
  doc.rect(0, 0, W, H, 'F')

  // Gold border
  doc.setDrawColor(225, 6, 0)
  doc.setLineWidth(1.5)
  doc.rect(8, 8, W - 16, H - 16)

  // Inner border
  doc.setLineWidth(0.3)
  doc.rect(12, 12, W - 24, H - 24)

  // Title
  doc.setTextColor(225, 6, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXUSLEARN PREMIUM', W / 2, 35, { align: 'center' })

  // Certificate text
  doc.setTextColor(240, 236, 226)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('Certificado de Conclusão', W / 2, 70, { align: 'center' })

  // Body
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(138, 134, 128)
  doc.text('Certificamos que', W / 2, 90, { align: 'center' })

  // Name
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(225, 6, 0)
  doc.text(name, W / 2, 108, { align: 'center' })

  // Course
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(138, 134, 128)
  doc.text('concluiu com êxito o curso', W / 2, 122, { align: 'center' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(240, 236, 226)
  doc.text(course, W / 2, 136, { align: 'center' })

  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 86, 80)
  doc.text(`Emitido em ${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, W / 2, 160, { align: 'center' })

  // Signature line
  doc.setDrawColor(90, 86, 80)
  doc.setLineWidth(0.3)
  doc.line(80, 182, 140, 182)
  doc.line(157, 182, 217, 182)
  doc.setFontSize(9)
  doc.setTextColor(90, 86, 80)
  doc.text('Diretor Acadêmico', 110, 188, { align: 'center' })
  doc.text('NexusLearn Premium', 187, 188, { align: 'center' })

  doc.save(`certificado-${course.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

export function StudentCertificates() {
  const { user } = useAuth()

  return (
    <PageLayout>
      <FadeIn>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: C.text, margin: '0 0 8px' }}>
            Seus Certificados
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, margin: 0 }}>
            Cada certificado é uma conquista. Compartilhe no LinkedIn e mostre sua evolução.
          </p>
        </div>
      </FadeIn>

      {MOCK_CERTIFICATES.length === 0 ? (
        <FadeIn delay={100}>
          <div style={{ textAlign: 'center', padding: '80px 32px', color: C.textMuted }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <h3 style={{ fontSize: 20, color: C.text, marginBottom: 8 }}>Nenhum certificado ainda</h3>
            <p>Conclua um curso para receber seu certificado.</p>
          </div>
        </FadeIn>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 24 }}>
          {MOCK_CERTIFICATES.map((cert, i) => (
            <FadeIn key={cert.id} delay={i * 100}>
              {/* Certificate card */}
              <Card glow style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                {/* Certificate visual */}
                <div style={{
                  background: 'linear-gradient(135deg, #06060a, #0c0c12)',
                  border: `2px solid ${'rgba(225,6,0,0.4)'}`,
                  padding: 40, textAlign: 'center', position: 'relative',
                }}>
                  {/* Decorative corners */}
                  {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], idx) => (
                    <div key={idx} style={{
                      position: 'absolute', [v]: 12, [h]: 12,
                      width: 20, height: 20,
                      borderTop: v === 'top' ? `2px solid ${'#E10600'}` : 'none',
                      borderBottom: v === 'bottom' ? `2px solid ${'#E10600'}` : 'none',
                      borderLeft: h === 'left' ? `2px solid ${'#E10600'}` : 'none',
                      borderRight: h === 'right' ? `2px solid ${'#E10600'}` : 'none',
                    }} />
                  ))}

                  <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#E10600', marginBottom: 16, fontWeight: 700 }}>
                    NEXUSLEARN PREMIUM
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: C.text, marginBottom: 8 }}>
                    Certificado de Conclusão
                  </div>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 16px' }}>Certificamos que</p>
                  <div style={{ fontWeight: 700, fontSize: 26, color: '#E10600', marginBottom: 8 }}>
                    {user?.name ?? cert.user?.name}
                  </div>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 6px' }}>concluiu com êxito o curso</p>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 24 }}>
                    {cert.course?.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim }}>
                    Emitido em {new Date(cert.issued_at).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  padding: '16px 24px', display: 'flex', gap: 12,
                  borderTop: `1px solid ${C.borderSubtle}`,
                }}>
                  <Button
                    variant="primary" size="md" fullWidth
                    icon={<Icons.Download size={14} />}
                    onClick={() => generateCertificatePDF(
                      user?.name ?? cert.user?.name ?? '',
                      cert.course?.title ?? '',
                      cert.issued_at
                    )}
                  >
                    Baixar PDF
                  </Button>
                  <Button variant="ghost" size="md"
                    icon={<Icons.Share size={14} />}
                    onClick={() => {
                      const text = `Acabei de concluir o curso "${cert.course?.title}" na @NexusLearn! 🎓`
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`, '_blank')
                    }}
                  >
                    Compartilhar
                  </Button>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
