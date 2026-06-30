export interface DashboardSummary {
  totalMonth: number
  totalToday: number
  transactionCount: number
  dailyAverage: number
}

export interface CategorySeriesItem {
  label: string
  value: number
}

export interface MonthlySeriesItem {
  month: string
  value: number
}

export interface PaymentSeriesItem {
  label: string
  value: number
}

export interface DashboardResponse {
  summary: DashboardSummary
  categorySeries: CategorySeriesItem[]
  monthlySeries: MonthlySeriesItem[]
  paymentSeries: PaymentSeriesItem[]
}
