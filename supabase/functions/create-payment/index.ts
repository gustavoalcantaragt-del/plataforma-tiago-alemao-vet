// ─────────────────────────────────────────────────────────────────
// Edge Function: create-payment
// Cria um cliente + cobrança no Asaas e registra o pagamento no banco.
// Variáveis de ambiente necessárias:
//   ASA_API_KEY   — chave da API Asaas ($aact_...)
//   ASA_ENV       — "sandbox" ou "production"
//   SUPABASE_URL  — URL do projeto Supabase
//   SUPABASE_SERVICE_ROLE_KEY — chave de serviço (sem RLS)
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
    headers: {
      'access_token': ASA_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Asaas ${method} ${path}: ${err}`)
  }
  return res.json()
}

/** Encontra ou cria cliente na Asaas pelo CPF */
async function findOrCreateCustomer(name: string, email: string, cpf: string) {
  // Busca por CPF
  const search = await asaFetch(`/customers?cpfCnpj=${cpf}`, 'GET')
  if (search.data?.length > 0) return search.data[0].id

  // Cria novo cliente
  const customer = await asaFetch('/customers', 'POST', {
    name, email, cpfCnpj: cpf, notificationDisabled: false,
  })
  return customer.id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      productId, productType, productTitle, amount,
      paymentMethod, customer,
    } = await req.json()

    // Autenticar usuário via JWT
    const authHeader = req.headers.get('Authorization') ?? ''
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Criar/encontrar cliente no Asaas
    const customerId = await findOrCreateCustomer(
      customer.name, customer.email, customer.cpf,
    )

    // Calcular data de vencimento (hoje + 1 dia para boleto, hoje para PIX/cartão)
    const dueDate = new Date()
    if (paymentMethod === 'BOLETO') dueDate.setDate(dueDate.getDate() + 3)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    // Criar cobrança no Asaas
    const paymentData: Record<string, unknown> = {
      customer: customerId,
      billingType: paymentMethod,
      value: amount,
      dueDate: dueDateStr,
      description: productTitle,
      externalReference: `${user.id}|${productId}|${productType}`,
    }

    const payment = await asaFetch('/payments', 'POST', paymentData)

    // Salvar pagamento pendente no banco
    await supabase.from('payments').insert({
      user_id: user.id,
      asa_payment_id: payment.id,
      product_type: productType,
      product_id: productId,
      amount,
      status: 'pending',
      payment_method: paymentMethod.toLowerCase().replace('_', '_'),
      created_at: new Date().toISOString(),
    })

    // Montar resposta com dados específicos do método
    const result: Record<string, string> = { paymentId: payment.id, status: payment.status }

    if (paymentMethod === 'PIX') {
      // Buscar QR code do PIX
      const pix = await asaFetch(`/payments/${payment.id}/pixQrCode`, 'GET')
      result.pixQrCode = pix.encodedImage
      result.pixCopiaECola = pix.payload
    } else {
      result.checkoutUrl = payment.bankSlipUrl ?? payment.invoiceUrl ?? ''
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
