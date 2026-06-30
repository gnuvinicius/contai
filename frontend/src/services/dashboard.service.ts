import { http } from '@/api/http'
import type { DashboardResponse } from '@/types/dashboard'

export const DashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const { data } = await http.get<DashboardResponse>('/dashboard')
    return data
  },
}
