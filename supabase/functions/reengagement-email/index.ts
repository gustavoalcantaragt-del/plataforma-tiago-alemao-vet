/**
 * reengagement-email — Supabase Edge Function (Deno)
 *
 * Triggered by a scheduled cron (pg_cron or Supabase scheduled function).
 * Finds students inactive for 7+ days and sends a reengagement email
 * via Resend (or any SMTP-compatible provider).
 *
 * Setup in Supabase dashboard:
 *   - Edge Function: supabase/functions/reengagement-email
 *   - Cron: every day at 09:00 BRT → calls this function
 *     CRON: "0 12 * * *"  (12 UTC = 09:00 BRT)
 *
 * Environment variables required:
 *   RESEND_API_KEY     — your Resend API key (https://resend.com)
 *   FROM_EMAIL         — verified sender address (e.g. noreply@tiagoedu.com.br)
 *   PLATFORM_URL       — frontend URL (e.g. https://app.tiagoedu.com.br)
 *   PLATFORM_NAME      — platform display name
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL      = Deno.env.get('FROM_EMAIL') ?? 'noreply@tiagoedu.com.br'
const PLATFORM_URL    = Deno.env.get('PLATFORM_URL') ?? 'https://app.tiagoedu.com.br'
const PLATFORM_NAME   = Deno.env.get('PLATFORM_NAME') ?? 'Tiago Alemão VET'

const INACTIVE_DAYS_THRESHOLD = 7

// ─── Email template ────────────────────────────────────────────────────────────
function buildEmailHtml(name: string, firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sentimos sua falta, ${firstName}!</title>
  <style>
    body { margin: 0; padding: 0; background: #0d0d0d; font-family: 'Outfit', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #161616; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; }
    .header { background: linear-gradient(135deg, #1a1a1a, #161616); padding: 32px 40px; text-align: center; border-bottom: 1px solid #2a2a2a; }
    .logo { font-size: 28px; font-weight: 900; color: #D4AF37; letter-spacing: -1px; }
    .logo span { color: #fff; }
    .body { padding: 40px; }
    h1 { font-size: 24px; color: #fff; margin: 0 0 16px; line-height: 1.3; }
    p { font-size: 15px; color: #9CA3AF; line-height: 1.7; margin: 0 0 20px; }
    .highlight { color: #D4AF37; font-weight: 600; }
    .cta-btn {
      display: inline-block; padding: 14px 32px;
      background: linear-gradient(135deg, #D4AF37, #B8960C);
      color: #000; font-weight: 700; font-size: 15px;
      text-decoration: none; border-radius: 10px;
      margin: 8px 0 24px;
    }
    .stats { display: flex; gap: 0; background: #1e1e1e; border-radius: 12px; overflow: hidden; margin-bottom: 28px; }
    .stat { flex: 1; padding: 16px 12px; text-align: center; border-right: 1px solid #2a2a2a; }
    .stat:last-child { border-right: none; }
    .stat-value { font-size: 22px; font-weight: 800; color: #D4AF37; }
    .stat-label { font-size: 11px; color: #6B7280; margin-top: 2px; }
    .footer { padding: 24px 40px; border-top: 1px solid #2a2a2a; text-align: center; }
    .footer p { font-size: 12px; color: #4B5563; margin: 0; }
    .footer a { color: #6B7280; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Tiago Alemão <span>VET</span></div>
    </div>
    <div class="body">
      <h1>Sentimos sua falta, ${firstName}! 👋</h1>
      <p>
        Percebemos que faz alguns dias que você não acessa a plataforma.
        Seus cursos e materiais estão te esperando — e cada dia de estudo
        te aproxima mais dos seus objetivos na medicina veterinária.
      </p>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">🎓</div>
          <div class="stat-label">Cursos novos<br>disponíveis</div>
        </div>
        <div class="stat">
          <div class="stat-value">💬</div>
          <div class="stat-label">Comunidade<br>ativa</div>
        </div>
        <div class="stat">
          <div class="stat-value">📅</div>
          <div class="stat-label">Lives<br>agendadas</div>
        </div>
      </div>

      <p>
        <span class="highlight">Continue de onde parou</span> — não perca o ritmo que você construiu.
        Basta um clique para retomar sua jornada.
      </p>

      <center>
        <a href="${PLATFORM_URL}/dashboard" class="cta-btn">
          Retomar meus estudos →
        </a>
      </center>

      <p style="font-size: 13px; color: #6B7280;">
        "O sucesso na medicina veterinária é construído dia a dia, aula por aula."
        <br><em>— Tiago Alemão</em>
      </p>
    </div>
    <div class="footer">
      <p>
        Você recebeu este email porque está cadastrado em <strong style="color: #9CA3AF">${PLATFORM_NAME}</strong>.
        <br>
        <a href="${PLATFORM_URL}/perfil">Gerenciar notificações</a> ·
        <a href="${PLATFORM_URL}/perfil">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── Send email via Resend ─────────────────────────────────────────────────────
async function sendEmail(to: string, name: string): Promise<boolean> {
  const firstName = name.split(' ')[0]
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${PLATFORM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Sentimos sua falta, ${firstName}! Seu progresso te espera 🎓`,
      html: buildEmailHtml(name, firstName),
    }),
  })
  return res.ok
}

// ─── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Allow manual trigger via POST as well as cron invocations
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role — bypasses RLS
  )

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - INACTIVE_DAYS_THRESHOLD)

  // Find users whose last_sign_in_at is older than threshold
  // and who have not received a reengagement email in the last 14 days
  const { data: inactiveUsers, error } = await supabase
    .from('profiles')
    .select('id, name, email, last_reengagement_sent_at')
    .lt('last_active_at', cutoffDate.toISOString())
    .or(`last_reengagement_sent_at.is.null,last_reengagement_sent_at.lt.${new Date(Date.now() - 14 * 86400000).toISOString()}`)
    .eq('email_reengagement', true) // respect opt-out
    .limit(50) // process in batches to stay within Edge Function limits

  if (error) {
    console.error('Query error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const users = inactiveUsers ?? []
  const results = { sent: 0, failed: 0, skipped: 0 }

  for (const user of users) {
    if (!user.email || !user.name) { results.skipped++; continue }

    const ok = await sendEmail(user.email, user.name)
    if (ok) {
      results.sent++
      // Record that we sent this email to avoid duplicates
      await supabase
        .from('profiles')
        .update({ last_reengagement_sent_at: new Date().toISOString() })
        .eq('id', user.id)
    } else {
      results.failed++
      console.warn(`Failed to send to ${user.email}`)
    }
  }

  console.log(`Reengagement emails: ${JSON.stringify(results)}`)
  return new Response(JSON.stringify({ success: true, ...results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
