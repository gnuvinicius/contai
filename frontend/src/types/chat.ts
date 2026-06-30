export interface ParsedExpense {
  description: string
  amount: number
  merchant: string
  paymentMethod: string
  category: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  parsedExpense?: ParsedExpense
}

export interface ChatResponse {
  message: string
  parsedExpense?: ParsedExpense
}
