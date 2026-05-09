// ─────────────────────────────────────────────────────────────────
// Edge Function: asa-webhook
// Recebe eventos do Asaas e atualiza o banco de dados.
//
// Configure no painel Asaas → Integrações → Webhooks:
//   URL: https://<projeto>.supabase.co/functions/v1/asa-webhook
//   Eventos: payment.confirmed, payment.overdue, payment.refunded,
//             subscription.cancelled, subscription.expired
//
// Variáveis de ambiente:
//   ASA_WEBHOOK_TOKEN — token gerado no painel Asaas para validação
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// ─────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_TOKEN = Deno.env.get('ASA_WEBHOOK_TOKEN') ?? ''

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  // Validar token do webhook (Asaas envia no header asaas-access-token)
  const token = req.headers.get('asaas-access-token')
  if (WEBHOOK_TOKEN && token !== WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = await req.json()
  const { event: eventType, payment, subscription } = event

  console.log(`[asa-webhook] event: ${eventType}`)

  try {
    // ── Pagamento confirmado ──────────────────────────────────────
    if (eventType === 'PAYMENT_CONFIRMED' || eventType === 'PAYMENT_RECEIVED') {
      const asaPaymentId = payment.id
      const externalRef: string = payment.externalReference ?? ''
      const [userId, productId, productType] = externalRef.split('|')

      // Atualizar status do pagamento
      await supabase
        .from('payments')
        .update({
          status: 'confirmed',
          paid_at: new Date().toISOString(),
        })
        .eq('asa_payment_id', asaPaymentId)

      // Liberar acesso ao produto
      if (userId && productId) {
        await supabase.from('user_access').upsert({
          user_id: userId,
          product_id: productId,
          product_type: productType ?? 'course',
          source: 'payment',
          granted_at: new Date().toISOString(),
          expires_at: null, // pagamento único = vitalício
        }, { onConflict: 'user_id,product_id' })
      }
    }

    // ── Pagamento vencido ─────────────────────────────────────────
    if (eventType === 'PAYMENT_OVERDUE') {
      await supabase
        .from('payments')
        .update({ status: 'overdue' })
        .eq('asa_payment_id', payment.id)
    }

    // ── Pagamento reembolsado ─────────────────────────────────────
    if (eventType === 'PAYMENT_REFUNDED') {
      const externalRef: string = payment.externalReference ?? ''
      const [userId, productId] = externalRef.split('|')

      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('asa_payment_id', payment.id)

      // Revogar acesso
      if (userId && productId) {
        await supabase
          .from('user_access')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)
      }
    }

    // ── Assinatura renovada (cobrança mensal confirmada) ───────────
    if (eventType === 'PAYMENT_CONFIRMED' && subscription?.id) {
      // Para assinaturas, estender expires_at por +31 dias
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 31)

      const externalRef: string = payment.externalReference ?? ''
      const [userId, productId, productType] = externalRef.split('|')

      if (userId && productId) {
        await supabase.from('user_access').upsert({
          user_id: userId,
          product_id: productId,
          product_type: productType ?? 'subscription',
          source: 'payment',
          granted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }, { onConflict: 'user_id,product_id' })
      }

      // Atualizar status da assinatura
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          next_billing_at: expiresAt.toISOString(),
        })
        .eq('asa_subscription_id', subscription.id)
    }

    // ── Assinatura cancelada / expirada ───────────────────────────
    if (eventType === 'SUBSCRIPTION_CANCELLED' || eventType === 'SUBSCRIPTION_EXPIRED') {
      const asaSubId = subscription?.id
      if (!asaSubId) return new Response('ok')

      // Atualizar status
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('asa_subscription_id', asaSubId)

      // Buscar user_id pelo asa_subscription_id
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id, plan_id')
        .eq('asa_subscription_id', asaSubId)
        .single()

      if (sub) {
        // Revogar acesso ao plano
        await supabase
          .from('user_access')
          .delete()
          .eq('user_id', sub.user_id)
          .eq('product_id', sub.plan_id)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[asa-webhook] error:', err)
    return new Response('Internal error', { status: 500 })
  }
})
