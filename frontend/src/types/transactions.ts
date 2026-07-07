export type TransactionType = 'Receita' | 'Despesa'

export type PaymentMethod = string

export interface Transaction {
  id: number
  user: number
  status: string
  type: string
  description: string
  merchantName: string | null
  amount: number
  totalAmount: number
  currency: string
  paymentMethod: string | null
  isInstallment: boolean
  installment: number | null
  installmentTotal: number | null
  dueDate: string
  createdAt?: string
  updatedAt?: string | null
}

export interface TransactionInput {
  type: string
  description: string
  merchantName: string | null
  amount: number
  isInstallment: boolean
  installment: number | null
  installmentTotal: number | null
  dueDate: string
}

export interface ParsedTransactionInput extends TransactionInput {
  paymentMethod?: string | null
}

export interface ExtractedTransactionResponse {
  request: {
    user_input: string
    prompt: string
  }
  response: Record<string, unknown>
}
