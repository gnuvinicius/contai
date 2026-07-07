import { apiRequest } from '@/services/api'
import type { ExtractedTransactionResponse } from '@/types/transactions'

export async function parseNaturalLanguageEntry(input: string): Promise<ExtractedTransactionResponse> {
  return await apiRequest<ExtractedTransactionResponse>('/transactions/extractions/', {
    method: 'POST',
    body: JSON.stringify({ text: input }),
  })
}
