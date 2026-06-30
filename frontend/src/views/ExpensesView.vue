<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown, SlidersHorizontal } from '@lucide/vue'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DataTable, { type Column } from '@/components/tables/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import Input from '@/components/ui/Input.vue'
import { useExpenseStore } from '@/stores/expense'
import type { Transaction } from '@/types/expense'
import { formatCurrency, formatDate } from '@/utils/format'

const expenseStore = useExpenseStore()

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

const paymentMethods = [
  { value: 'credito', label: 'Credito' },
  { value: 'debito', label: 'Debito' },
  { value: 'pix', label: 'Pix' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
]

const ALL_OPTION = '__all__'

function normalizePaymentMethod(paymentMethod: string | null): string {
  if (!paymentMethod) {
    return ''
  }

  return paymentMethod.trim().toLowerCase()
}

const categories = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Moradia',
  'Vestuário',
  'Tecnologia',
  'Serviços',
  'Outros',
]

const showFilterMenu = ref(false)
const filterMenuRef = ref<HTMLElement | null>(null)
const isEditDrawerOpen = ref(false)
const selectedTransactionId = ref<number | null>(null)
const editForm = ref({
  description: '',
  merchantName: '',
  type: '',
  paymentMethod: '',
  amount: '',
  dueDate: '',
})

onClickOutside(filterMenuRef, () => {
  showFilterMenu.value = false
})

function toggleFilterMenu(): void {
  showFilterMenu.value = !showFilterMenu.value
}

const columns: Column<Transaction>[] = [
  { key: 'dueDate', label: 'Data', sortable: true, format: (value) => formatDate(String(value)) },
  { key: 'description', label: 'Descricao', sortable: true },
  { key: 'merchantName', label: 'Estabelecimento', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'paymentMethod', label: 'Forma de Pagamento', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, format: (value) => formatCurrency(Number(value)) },
]

const rows = computed(() => expenseStore.list?.items ?? [])

function toInputDate(date: string): string {
  if (!date) {
    return ''
  }

  return date.split('T')[0]
}

onMounted(() => {
  void expenseStore.fetchExpenses()
})

function onSort(sortBy: string): void {
  const sortOrder =
    expenseStore.filters.sortBy === sortBy && expenseStore.filters.sortOrder === 'asc' ? 'desc' : 'asc'

  expenseStore.updateFilters({
    sortBy: sortBy as keyof Transaction,
    sortOrder,
  })

  void expenseStore.fetchExpenses()
}

function onSearch(): void {
  expenseStore.updateFilters({ page: 1 })
  void expenseStore.fetchExpenses()
}

function onChangePage(page: number): void {
  expenseStore.updateFilters({ page })
  void expenseStore.fetchExpenses()
}

function clearFilters(): void {
  expenseStore.updateFilters({
    search: '',
    type: '',
    paymentMethod: '',
    month: '',
    year: '',
    page: 1,
  })
  void expenseStore.fetchExpenses()
}

function onRowClick(transaction: Transaction): void {
  selectedTransactionId.value = transaction.id
  editForm.value = {
    description: transaction.description,
    merchantName: transaction.merchantName ?? '',
    type: transaction.type,
    paymentMethod: normalizePaymentMethod(transaction.paymentMethod),
    amount: transaction.amount,
    dueDate: toInputDate(transaction.dueDate),
  }
  isEditDrawerOpen.value = true
}

function closeEditDrawer(): void {
  isEditDrawerOpen.value = false
  selectedTransactionId.value = null
}

function submitEditTransaction(): void {
  if (!expenseStore.list || selectedTransactionId.value === null) {
    closeEditDrawer()
    return
  }

  const transaction = expenseStore.list.items.find((item) => item.id === selectedTransactionId.value)
  if (!transaction) {
    closeEditDrawer()
    return
  }

  transaction.description = editForm.value.description
  transaction.merchantName = editForm.value.merchantName || null
  transaction.type = editForm.value.type
  transaction.paymentMethod = editForm.value.paymentMethod || null
  transaction.amount = editForm.value.amount
  transaction.dueDate = editForm.value.dueDate

  closeEditDrawer()
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900">Gastos</h2>
        <p class="mt-1 text-sm text-slate-500">Busque, filtre e organize suas transacoes.</p>
      </div>
    </div>

    <div id="filter-expense" class="mt-5 rounded-xl border border-border bg-white p-4">
      <div class="flex flex-wrap items-center justify-end gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <Select
            :model-value="expenseStore.filters.year || ALL_OPTION"
            @update:model-value="(value) => expenseStore.updateFilters({ year: value === ALL_OPTION ? '' : value })"
          >
            <SelectTrigger
              class="h-10 min-w-[180px] rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none"
            >
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="ALL_OPTION">Todos os anos</SelectItem>
              <SelectItem v-for="y in years" :key="y" :value="y">{{ y }}</SelectItem>
            </SelectContent>
          </Select>

          <div ref="filterMenuRef" class="relative">
            <Button variant="outline" class="flex items-center gap-1" @click="toggleFilterMenu">
              <SlidersHorizontal class="h-4 w-4" />
              Filtros
              <ChevronDown class="h-4 w-4 transition-transform" :class="{ 'rotate-180': showFilterMenu }" />
            </Button>

            <div
              v-if="showFilterMenu"
              class="absolute right-0 top-full z-20 mt-1 min-w-[220px] rounded-xl border border-border bg-white p-4 shadow-lg"
            >
              <p class="mb-1 text-xs font-medium text-slate-500">Forma de Pagamento</p>
              <Select
                :model-value="expenseStore.filters.paymentMethod || ALL_OPTION"
                @update:model-value="
                  (value) => expenseStore.updateFilters({ paymentMethod: value === ALL_OPTION ? '' : value })
                "
              >
                <SelectTrigger
                  class="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none"
                >
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="ALL_OPTION">Todas</SelectItem>
                  <SelectItem v-for="p in paymentMethods" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
                </SelectContent>
              </Select>

              <p class="mb-1 mt-3 text-xs font-medium text-slate-500">Tipo de Despesa</p>
              <Select
                :model-value="expenseStore.filters.type || ALL_OPTION"
                @update:model-value="(value) => expenseStore.updateFilters({ type: value === ALL_OPTION ? '' : value })"
              >
                <SelectTrigger
                  class="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none"
                >
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="ALL_OPTION">Todas</SelectItem>
                  <SelectItem v-for="c in categories" :key="c" :value="c">{{ c }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" @click="clearFilters">Limpar</Button>
          <Button @click="onSearch">Buscar</Button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <DataTable
        :columns="columns"
        :rows="rows"
        :row-clickable="true"
        :loading="expenseStore.isLoading"
        :page="expenseStore.list?.page ?? expenseStore.filters.page"
        :page-size="expenseStore.list?.pageSize ?? expenseStore.filters.pageSize"
        :total="expenseStore.list?.total ?? 0"
        :sort-by="String(expenseStore.filters.sortBy)"
        :sort-order="expenseStore.filters.sortOrder"
        empty-label="Nenhum gasto encontrado para os filtros aplicados."
        @sort="onSort"
        @change-page="onChangePage"
        @row-click="onRowClick"
      />

      <p v-if="expenseStore.error" class="mt-3 text-sm text-red-600">{{ expenseStore.error }}</p>
    </div>

    <Drawer
      v-model:open="isEditDrawerOpen"
      drawer-class="expenses-edit-drawer"
      title="Editar transacao"
      description="Atualize os dados da transacao selecionada."
      submit-label="salvar"
      cancel-label="Cancelar"
      @cancel="closeEditDrawer"
      @submit="submitEditTransaction"
    >
      <form class="space-y-4" @submit.prevent="submitEditTransaction">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Descricao</label>
          <Input v-model="editForm.description" placeholder="Digite a descricao" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Estabelecimento</label>
          <Input v-model="editForm.merchantName" placeholder="Digite o estabelecimento" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
          <Select v-model="editForm.type">
            <SelectTrigger
              class="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none"
            >
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in categories" :key="c" :value="c">{{ c }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Forma de pagamento</label>
          <Select v-model="editForm.paymentMethod">
            <SelectTrigger
              class="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none"
            >
              <SelectValue placeholder="Selecione uma forma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in paymentMethods" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Valor</label>
          <Input v-model="editForm.amount" type="number" placeholder="0.00" />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600">Data</label>
          <Input v-model="editForm.dueDate" type="date" />
        </div>
      </form>
    </Drawer>
  </section>
</template>

<style>
.expenses-edit-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  background: #0f172a59;
}

.expenses-edit-drawer .drawer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fff;
}

.expenses-edit-drawer .drawer-header {
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem;
}

.expenses-edit-drawer .drawer-title {
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 600;
}

.expenses-edit-drawer .drawer-description {
  margin-top: 0.25rem;
  color: #64748b;
  font-size: 0.875rem;
}

.expenses-edit-drawer .drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.expenses-edit-drawer .drawer-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem 1rem;
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
}

@media (min-width: 768px) {
  .expenses-edit-drawer .drawer-panel {
    max-width: 32rem;
    border-left: 1px solid #e2e8f0;
    box-shadow: 0 20px 40px #0f172a33;
  }

  .expenses-edit-drawer .drawer-header,
  .expenses-edit-drawer .drawer-content,
  .expenses-edit-drawer .drawer-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (max-width: 767px) {
  .expenses-edit-drawer .drawer-panel {
    width: 100%;
    max-width: 100%;
    height: 100dvh;
  }

  .expenses-edit-drawer .drawer-content {
    padding-bottom: 6rem;
  }
}
</style>
