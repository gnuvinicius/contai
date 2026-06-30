<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import { computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

import Card from '@/components/ui/Card.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { formatCurrency } from '@/utils/format'

const dashboardStore = useDashboardStore()

onMounted(() => {
  void dashboardStore.fetchDashboard()
})

const categoryOptions = computed<ApexOptions>(() => ({
  labels: dashboardStore.data?.categorySeries.map((item) => item.label) ?? [],
  legend: { position: 'bottom' as const },
  colors: ['#0A66C2', '#3D8EEA', '#76B0F2', '#A1C7F6', '#C4DCF9'],
}))

const categorySeries = computed(() => dashboardStore.data?.categorySeries.map((item) => item.value) ?? [])

const monthlyOptions = computed<ApexOptions>(() => ({
  chart: { toolbar: { show: false } },
  xaxis: { categories: dashboardStore.data?.monthlySeries.map((item) => item.month) ?? [] },
  stroke: { curve: 'smooth' as const, width: 3 },
  colors: ['#0A66C2'],
}))

const monthlySeries = computed(() => [
  {
    name: 'Gastos',
    data: dashboardStore.data?.monthlySeries.map((item) => item.value) ?? [],
  },
])

const paymentOptions = computed<ApexOptions>(() => ({
  chart: { stacked: true, toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 8 } },
  xaxis: { categories: ['Forma de pagamento'] },
  colors: ['#0A66C2', '#3D8EEA', '#76B0F2', '#A1C7F6'],
}))

const paymentSeries = computed(() =>
  (dashboardStore.data?.paymentSeries ?? []).map((item) => ({
    name: item.label,
    data: [item.value],
  })),
)
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold text-slate-900">Dashboard Financeiro</h2>
    <p class="mt-1 text-sm text-slate-500">Visao geral dos gastos com dados atualizados pela API.</p>

    <div v-if="dashboardStore.isLoading" class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="n in 4" :key="n" class="h-32" />
    </div>

    <div v-else-if="dashboardStore.error" class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ dashboardStore.error }}
    </div>

    <template v-else-if="dashboardStore.data">
      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p class="text-sm text-slate-500">Total gasto no mes</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(dashboardStore.data.summary.totalMonth) }}</p>
        </Card>
        <Card>
          <p class="text-sm text-slate-500">Total gasto hoje</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(dashboardStore.data.summary.totalToday) }}</p>
        </Card>
        <Card>
          <p class="text-sm text-slate-500">Quantidade de transacoes</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ dashboardStore.data.summary.transactionCount }}</p>
        </Card>
        <Card>
          <p class="text-sm text-slate-500">Media diaria</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ formatCurrency(dashboardStore.data.summary.dailyAverage) }}</p>
        </Card>
      </div>

      <div class="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 class="text-sm font-semibold text-slate-700">Gastos por categoria</h3>
          <VueApexCharts type="donut" height="320" :options="categoryOptions" :series="categorySeries" />
        </Card>

        <Card>
          <h3 class="text-sm font-semibold text-slate-700">Evolucao mensal</h3>
          <VueApexCharts type="line" height="320" :options="monthlyOptions" :series="monthlySeries" />
        </Card>
      </div>

      <div class="mt-4">
        <Card>
          <h3 class="text-sm font-semibold text-slate-700">Forma de pagamento</h3>
          <VueApexCharts type="bar" height="280" :options="paymentOptions" :series="paymentSeries" />
        </Card>
      </div>
    </template>
  </section>
</template>
