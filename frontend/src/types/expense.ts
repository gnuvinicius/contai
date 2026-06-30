export type TransactionStatus = 'active' | 'inactive'

export interface Transaction {
  id: number
  user: number
  status: TransactionStatus
  type: string
  paymentMethod: string | null
  description: string
  merchantName: string | null
  amount: string
  totalAmount: string
  currency: string
  isInstallment: boolean
  installment: number | null
  installmentTotal: number | null
  dueDate: string
}

export interface TransactionFilters {
  search: string
  type: string
  paymentMethod: string
  month: string
  year: string
  page: number
  pageSize: number
  sortBy: keyof Transaction | ''
  sortOrder: 'asc' | 'desc'
  status?: TransactionStatus
}

export interface TransactionListResponse {
  items: Transaction[]
  total: number
  page: number
  pageSize: number
}

export interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}
