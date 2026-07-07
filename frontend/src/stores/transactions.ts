import { ApiError, apiRequest } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { ParsedTransactionInput, Transaction } from '@/types/transactions'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface TransactionApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    id: number | string
    user: number | string
    status: string
    type: string
    description: string
    merchantName: string | null
    amount: number | string
    totalAmount: number | string
    currency: string
    paymentMethod: string | null
    isInstallment: boolean
    installment: number | string | null
    installmentTotal: number | string | null
    dueDate: string
    createdAt?: string
    updatedAt?: string | null
  }>
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return 0
  return Number(value)
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  return Number(value)
}

function isIncomeType(value: string) {
  return /receita|income|credit/i.test(value)
}

function normalizeTransaction(item: TransactionApiResponse['results'][number]): Transaction {
  return {
    id: Number(item.id),
    user: Number(item.user),
    status: item.status,
    type: item.type,
    description: item.description,
    merchantName: item.merchantName ?? null,
    amount: toNumber(item.amount),
    totalAmount: toNumber(item.totalAmount),
    currency: item.currency,
    paymentMethod: item.paymentMethod ?? null,
    isInstallment: item.isInstallment,
    installment: toNullableNumber(item.installment),
    installmentTotal: toNullableNumber(item.installmentTotal),
    dueDate: item.dueDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function normalizePayload(payload: ParsedTransactionInput) {
  return {
    type: payload.type,
    description: payload.description,
    merchantName: payload.merchantName,
    amount: payload.amount,
    isInstallment: payload.isInstallment,
    installment: payload.installment,
    installmentTotal: payload.installmentTotal,
    dueDate: payload.dueDate,
  }
}

async function requestWithAuthRetry<T>(request: () => Promise<T>) {
  const auth = useAuthStore()

  try {
    return await request()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshed = await auth.refreshSession().catch(() => false)
      if (refreshed) {
        return await request()
      }

      auth.logout()
    }

    throw error
  }
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate))
  })

  const currentMonth = computed(() => new Date().getMonth())
  const currentYear = computed(() => new Date().getFullYear())

  const monthTransactions = computed(() => {
    return transactions.value.filter((item) => {
      const date = new Date(item.dueDate)
      return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
    })
  })

  const monthRevenue = computed(() => {
    return monthTransactions.value
      .filter((item) => isIncomeType(item.type))
      .reduce((acc, item) => acc + item.amount, 0)
  })

  const monthExpense = computed(() => {
    return monthTransactions.value
      .filter((item) => !isIncomeType(item.type))
      .reduce((acc, item) => acc + item.amount, 0)
  })

  const totalBalance = computed(() => {
    return transactions.value.reduce(
      (acc, item) => acc + (isIncomeType(item.type) ? item.amount : -item.amount),
      0,
    )
  })

  const monthlySavings = computed(() => monthRevenue.value - monthExpense.value)

  const expensesByPaymentMethod = computed(() => {
    const buckets = new Map<string, number>()

    transactions.value
      .filter((item) => !isIncomeType(item.type))
      .forEach((item) => {
        const label = item.paymentMethod ?? 'Nao informado'
        buckets.set(label, (buckets.get(label) ?? 0) + item.amount)
      })

    return [...buckets.entries()].map(([label, value]) => ({ label, value }))
  })

  const monthlyBars = computed(() => {
    const bars = Array.from({ length: 6 }, (_, index) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - index))
      return { label: d.toLocaleDateString('pt-BR', { month: 'short' }), expense: 0 }
    })

    transactions.value.forEach((item) => {
      if (isIncomeType(item.type)) return
      const date = new Date(item.dueDate)
      const key = date.toLocaleDateString('pt-BR', { month: 'short' })
      const target = bars.find((bar) => bar.label === key)
      if (target) target.expense += item.amount
    })

    const max = Math.max(...bars.map((bar) => bar.expense), 1)
    return bars.map((bar) => ({ ...bar, percent: Math.round((bar.expense / max) * 100) }))
  })

  async function loadTransactions(force = false) {
    if (loaded.value && !force) return transactions.value

    loading.value = true
    error.value = null

    try {
      const collected: Transaction[] = []
      let next: string | null = '/transactions/transactions?page=1'

      while (next) {
        const response = await requestWithAuthRetry(() => apiRequest<TransactionApiResponse>(next as string))
        collected.push(...response.results.map(normalizeTransaction))
        next = response.next
      }

      transactions.value = collected
      loaded.value = true
      return transactions.value
    } catch (error_) {
      const message = error_ instanceof ApiError ? error_.message : 'Nao foi possivel carregar as movimentacoes.'
      error.value = message
      throw error_
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(payload: ParsedTransactionInput) {
    const response = await requestWithAuthRetry(() =>
      apiRequest<TransactionApiResponse['results'][number]>('/transactions/', {
        method: 'POST',
        body: JSON.stringify(normalizePayload(payload)),
      }),
    )

    const item = normalizeTransaction(response)
    transactions.value = [item, ...transactions.value.filter((transaction) => transaction.id !== item.id)]
    loaded.value = true
    return item
  }

  async function updateTransaction(id: number, payload: ParsedTransactionInput) {
    const response = await requestWithAuthRetry(() =>
      apiRequest<TransactionApiResponse['results'][number]>(`/transactions/transactions/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(normalizePayload(payload)),
      }),
    )

    const updated = normalizeTransaction(response)
    transactions.value = transactions.value.map((item) => (item.id === updated.id ? updated : item))
    return updated
  }

  async function removeTransaction(id: number) {
    await requestWithAuthRetry(() =>
      apiRequest<void>(`/transactions/${id}/`, {
        method: 'DELETE',
      }),
    )

    transactions.value = transactions.value.filter((item) => item.id !== id)
  }

  return {
    transactions,
    loading,
    loaded,
    error,
    sortedTransactions,
    monthRevenue,
    monthExpense,
    totalBalance,
    monthlySavings,
    expensesByPaymentMethod,
    monthlyBars,
    loadTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
  }
})
