import { http } from '@/api/http'
import type { TransactionFilters, TransactionListResponse, PaginatedResponse } from '@/types/expense'

export const TransactionService = {
  async list(filters: TransactionFilters): Promise<TransactionListResponse> {
    const { data } = await http.get<PaginatedResponse>('/transactions/transactions', {
      params: {
        search: filters.search,
        type: filters.type,
        paymentMethod: filters.paymentMethod,
        month: filters.month,
        year: filters.year,
        page: filters.page,
        limit: filters.pageSize,
        ordering: `${filters.sortOrder === 'desc' ? '-' : ''}${String(filters.sortBy)}`,
        status: filters.status,
      },
    })

    return {
      items: data.results,
      total: data.count,
      page: filters.page,
      pageSize: filters.pageSize,
    }
  },
}

// Backward compatibility alias
export const ExpenseService = TransactionService
