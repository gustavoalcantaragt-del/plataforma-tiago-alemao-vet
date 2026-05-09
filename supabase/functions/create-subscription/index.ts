// ─────────────────────────────────────────────────────────────────
// Edge Function: create-subscription
// Cria assinatura recorrente no Asaas (mensal ou anual).
// ─────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ASA_BASE = Deno.env.get('ASA_ENV') === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3'

const ASA_KEY = Deno.env.get('ASA_API_KEY') ?? ''

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function asaFetch(path: string, method: string, body?: unknown) {
  const res = await fetch(`${ASA_BASE}${path}`, {
    method,
    headers: { 'access_token': ASA_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Asaas ${method} ${path}: ${await res.text()}`)
  return res.json()
}

async function findOrCreateCustomer(name: string, email: string, cpf: string) {
  const search = await asaFetch(`/customers?cpfCnpj=${cpf}`, 'GET')
  if (search.data?.length > 0) return search.data[0].id
  const customer = await asaFetch('/customers', 'POST', {
    name, email, cpfCnpj: cpf, notificationDisabled: false,
  })
  return customer.id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { planId, planTitle, billingCycle, amount, customer } = await req.json()

    const authHeader = req.headers.get('Authorization') ?? ''
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const customerId = await findOrCreateCustomer(customer.name, customer.email, customer.cpf)

    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 1)

    const sub = await asaFetch('/subscriptions', 'POST', {
      customer: customerId,
      billingType: 'CREDIT_CARD',
      cycle: billingCycle === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
      value: amount,
      nextDueDate: nextBilling.toISOString().split('T')[0],
      description: planTitle,
      externalReference: `${user.id}|${planId}|subscription`,
    })

    // Registrar assinatura no banco
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      asa_subscription_id: sub.id,
      plan_id: planId,
      status: 'active',
      next_billing_at: nextBilling.toISOString(),
      created_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({
      subscriptionId: sub.id,
      checkoutUrl: sub.url ?? '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
