import type { ParsedTransactionInput, PaymentMethod, TransactionType } from '@/types/finance'

const expenseHints: Record<string, string> = {
  supermercado: 'Alimentacao',
  uber: 'Transporte',
  ifood: 'Alimentacao',
  aluguel: 'Moradia',
  netflix: 'Assinaturas',
  farmacia: 'Saude',
}

function pickType(input: string): TransactionType {
  return /(recebi|ganhei|salario|pagamento)/i.test(input) ? 'Receita' : 'Despesa'
}

function pickPaymentMethod(input: string): PaymentMethod {
  if (/pix/i.test(input)) return 'Pix'
  if (/credito/i.test(input)) return 'Cartao de Credito'
  if (/debito/i.test(input)) return 'Cartao de Debito'
  if (/dinheiro/i.test(input)) return 'Dinheiro'
  return 'Transferencia'
}

function pickAmount(input: string): number {
  const normalized = input.replace(/\./g, '').replace(',', '.')
  const match = normalized.match(/(\d+(?:\.\d{1,2})?)/)
  return match ? Number(match[1]) : 0
}

function pickCategory(input: string, type: TransactionType): string {
  if (type === 'Receita') return 'Renda'

  const found = Object.entries(expenseHints).find(([keyword]) => new RegExp(keyword, 'i').test(input))
  return found ? found[1] : 'Outros'
}

export async function parseNaturalLanguageEntry(input: string): Promise<ParsedTransactionInput> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const type = pickType(input)
  const amount = pickAmount(input)
  const paymentMethod = pickPaymentMethod(input)
  const category = pickCategory(input, type)

  return {
    amount,
    category,
    type,
    date: new Date().toISOString(),
    paymentMethod,
    description: input.trim() || 'Movimentacao sem descricao',
  }
}
