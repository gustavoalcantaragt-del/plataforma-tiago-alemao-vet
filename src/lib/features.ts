// ─────────────────────────────────────────────────────────────────
// Feature Flags — controladas por variáveis de ambiente
//
// Para ativar/desativar uma feature:
//   1. Ajuste o valor no .env (desenvolvimento)
//   2. Ajuste nas env vars do Netlify (produção)
//   3. Faça o redeploy — sem alterar código
// ─────────────────────────────────────────────────────────────────

/** Pagamentos via ASA (Asaas) — PIX, cartão, boleto.
 *  false → Loja exibe "Em breve", botões de compra desabilitados.
 *  true  → Checkout completo ativado.
 *  Defina VITE_ENABLE_PAYMENTS=true no Netlify quando o ASA estiver configurado. */
export const PAYMENTS_ENABLED = import.meta.env.VITE_ENABLE_PAYMENTS === 'true'

export const USE_MOCK_DATA = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_DATA === 'true'
