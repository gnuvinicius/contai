import { ref } from 'vue'
import { defineStore } from 'pinia'

import { DashboardService } from '@/services/dashboard.service'
import type { DashboardResponse } from '@/types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      data.value = await DashboardService.getDashboard()
    } catch {
      error.value = 'Nao foi possivel carregar o dashboard.'
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, fetchDashboard }
})
