<script setup lang="ts">
import BarChartCard from '@/components/dashboard/BarChartCard.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import PieChartCard from '@/components/dashboard/PieChartCard.vue'
import RecentTransactionsCard from '@/components/dashboard/RecentTransactionsCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { currency } from '@/utils/format'
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon, WalletIcon } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'

const auth = useAuthStore()
const transactionsStore = useTransactionsStore()
const loading = ref(true)

onMounted(async () => {
  await transactionsStore.loadTransactions()
  loading.value = false
})

const latestTransactions = computed(() => transactionsStore.sortedTransactions.slice(0, 8))
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm text-muted-foreground">Ola, {{ auth.displayName }}.</p>
      <h2 class="mt-1 text-2xl font-semibold tracking-tight">Visao geral financeira</h2>
    </div>

    <div v-if="loading || transactionsStore.loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="n in 4" :key="n" class="h-32 rounded-2xl" />
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Saldo Atual" :value="currency(transactionsStore.totalBalance)" hint="Consolidado geral" :icon="WalletIcon" />
      <KpiCard
        title="Receitas do mes"
        :value="currency(transactionsStore.monthRevenue)"
        hint="Entradas no periodo"
        :icon="TrendingUpIcon"
        tone="success"
      />
      <KpiCard
        title="Despesas do mes"
        :value="currency(transactionsStore.monthExpense)"
        hint="Saidas no periodo"
        :icon="TrendingDownIcon"
        tone="danger"
      />
      <KpiCard
        title="Economia do mes"
        :value="currency(transactionsStore.monthlySavings)"
        hint="Receitas - Despesas"
        :icon="PiggyBankIcon"
        tone="warning"
      />
    </div>

    <div class="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div class="space-y-4">
        <BarChartCard :bars="transactionsStore.monthlyBars" />
        <PieChartCard :values="transactionsStore.expensesByPaymentMethod" />
      </div>
      <RecentTransactionsCard :items="latestTransactions" />
    </div>
  </section>
</template>
