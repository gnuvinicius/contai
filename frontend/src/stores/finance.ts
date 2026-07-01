import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ParsedTransactionInput, Transaction } from '@/types/finance'

const initialTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2026-06-02T10:00:00.000Z',
    description: 'Salario mensal',
    category: 'Renda',
    type: 'Receita',
    amount: 8500,
    paymentMethod: 'Transferencia',
  },
  {
    id: 't2',
    date: '2026-06-03T19:10:00.000Z',
    description: 'Supermercado Central',
    category: 'Alimentacao',
    type: 'Despesa',
    amount: 620,
    paymentMethod: 'Pix',
  },
  {
    id: 't3',
    date: '2026-06-08T08:20:00.000Z',
    description: 'Plano de internet',
    category: 'Moradia',
    type: 'Despesa',
    amount: 139.9,
    paymentMethod: 'Cartao de Credito',
  },
  {
    id: 't4',
    date: '2026-06-12T12:45:00.000Z',
    description: 'Corridas de aplicativo',
    category: 'Transporte',
    type: 'Despesa',
    amount: 184,
    paymentMethod: 'Cartao de Debito',
  },
  {
    id: 't5',
    date: '2026-06-17T14:20:00.000Z',
    description: 'Freela produto digital',
    category: 'Renda Extra',
    type: 'Receita',
    amount: 1800,
    paymentMethod: 'Pix',
  },
  {
    id: 't6',
    date: '2026-06-20T20:30:00.000Z',
    description: 'Assinatura streaming',
    category: 'Assinaturas',
    type: 'Despesa',
    amount: 59.9,
    paymentMethod: 'Cartao de Credito',
  },
]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>(initialTransactions)

  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  })

  const currentMonth = computed(() => new Date().getMonth())
  const currentYear = computed(() => new Date().getFullYear())

  const monthTransactions = computed(() => {
    return transactions.value.filter((item) => {
      const date = new Date(item.date)
      return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
    })
  })

  const monthRevenue = computed(() => {
    return monthTransactions.value
      .filter((item) => item.type === 'Receita')
      .reduce((acc, item) => acc + item.amount, 0)
  })

  const monthExpense = computed(() => {
    return monthTransactions.value
      .filter((item) => item.type === 'Despesa')
      .reduce((acc, item) => acc + item.amount, 0)
  })

  const totalBalance = computed(() => {
    return transactions.value.reduce((acc, item) => acc + (item.type === 'Receita' ? item.amount : -item.amount), 0)
  })

  const monthlySavings = computed(() => monthRevenue.value - monthExpense.value)

  const monthlyByCategory = computed(() => {
    const buckets = new Map<string, number>()
    monthTransactions.value
      .filter((item) => item.type === 'Despesa')
      .forEach((item) => {
        const current = buckets.get(item.category) ?? 0
        buckets.set(item.category, current + item.amount)
      })

    return [...buckets.entries()].map(([category, value]) => ({ category, value }))
  })

  const monthlyBars = computed(() => {
    const bars = Array.from({ length: 6 }, (_, index) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - index))
      return { label: d.toLocaleDateString('pt-BR', { month: 'short' }), expense: 0 }
    })

    transactions.value.forEach((item) => {
      if (item.type !== 'Despesa') return
      const date = new Date(item.date)
      const key = date.toLocaleDateString('pt-BR', { month: 'short' })
      const target = bars.find((bar) => bar.label === key)
      if (target) target.expense += item.amount
    })

    const max = Math.max(...bars.map((bar) => bar.expense), 1)
    return bars.map((bar) => ({ ...bar, percent: Math.round((bar.expense / max) * 100) }))
  })

  function addTransaction(payload: ParsedTransactionInput) {
    transactions.value.unshift({
      id: makeId(),
      ...payload,
    })
  }

  function updateTransaction(id: string, payload: ParsedTransactionInput) {
    const idx = transactions.value.findIndex((item) => item.id === id)
    if (idx === -1) return
    transactions.value[idx] = { ...transactions.value[idx], ...payload }
  }

  function removeTransaction(id: string) {
    transactions.value = transactions.value.filter((item) => item.id !== id)
  }

  return {
    transactions,
    sortedTransactions,
    monthRevenue,
    monthExpense,
    totalBalance,
    monthlySavings,
    monthlyByCategory,
    monthlyBars,
    addTransaction,
    updateTransaction,
    removeTransaction,
  }
})
