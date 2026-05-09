// ─────────────────────────────────────────────
// ASA (Asaas) — Cliente via Supabase Edge Functions
// A chave API fica segura no servidor (Edge Function)
// nunca exposta no frontend
// ─────────────────────────────────────────────

import { supabase } from './supabase'

export interface CreatePaymentParams {
  productId: string
  productType: string
  productTitle: string
  amount: number
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  customer: {
    name: string
    email: string
    cpf: string
  }
}

export interface CreatePaymentResult {
  paymentId: string
  status: string
  checkoutUrl?: string
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  boletoBarCode?: string
}

export interface CreateSubscriptionParams {
  planId: string
  planTitle: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  amount: number
  customer: {
    name: string
    email: string
    cpf: string
  }
}

/** Cria cobrança avulsa no Asaas (PIX, cartão ou boleto) */
export async function createPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResult> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: params,
  })
  if (error) throw new Error(error.message)
  return data as CreatePaymentResult
}

/** Cria assinatura recorrente no Asaas */
export async function createSubscription(
  params: CreateSubscriptionParams,
): Promise<{ subscriptionId: string; checkoutUrl: string }> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: params,
  })
  if (error) throw new Error(error.message)
  return data
}

/** Formata valor em reais */
export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
