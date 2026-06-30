import { ref } from 'vue'
import { defineStore } from 'pinia'

import { TransactionService } from '@/services/expense.service'
import type { TransactionFilters, TransactionListResponse } from '@/types/expense'

const defaultFilters: TransactionFilters = {
  search: '',
  type: '',
  paymentMethod: '',
  month: '',
  year: '',
  page: 1,
  pageSize: 10,
  sortBy: 'dueDate',
  sortOrder: 'desc',
  status: 'active',
}

export const useExpenseStore = defineStore('expense', () => {
  const filters = ref<TransactionFilters>({ ...defaultFilters })
  const list = ref<TransactionListResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchExpenses(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      list.value = await TransactionService.list(filters.value)
    } catch {
      error.value = 'Nao foi possivel carregar as transacoes.'
    } finally {
      isLoading.value = false
    }
  }

  function updateFilters(next: Partial<TransactionFilters>): void {
    filters.value = { ...filters.value, ...next }
  }

  return { filters, list, isLoading, error, fetchExpenses, updateFilters }
})
