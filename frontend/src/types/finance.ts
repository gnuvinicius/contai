export type TransactionType = 'Receita' | 'Despesa'

export type PaymentMethod = 'Pix' | 'Cartao de Credito' | 'Cartao de Debito' | 'Dinheiro' | 'Transferencia'

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  type: TransactionType
  amount: number
  paymentMethod: PaymentMethod
}

export interface ParsedTransactionInput {
  amount: number
  category: string
  type: TransactionType
  date: string
  paymentMethod: PaymentMethod
  description: string
}
