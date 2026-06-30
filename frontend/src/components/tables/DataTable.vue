<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'

import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

export interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  format?: (value: unknown, row: T) => string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  emptyLabel?: string
  rowClickable?: boolean
  page: number
  pageSize: number
  total: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props<T>>(), {
  loading: false,
  emptyLabel: 'Nenhum registro encontrado.',
  rowClickable: false,
  sortBy: '',
  sortOrder: 'desc',
})

const emit = defineEmits<{
  (event: 'sort', value: string): void
  (event: 'change-page', value: number): void
  (event: 'row-click', value: T): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

function onSort(columnKey: string, sortable?: boolean): void {
  if (!sortable) {
    return
  }
  emit('sort', columnKey)
}

function onRowClick(row: T): void {
  if (!props.rowClickable) {
    return
  }

  emit('row-click', row)
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th v-for="column in columns" :key="String(column.key)" class="px-4 py-3 font-semibold">
              <button
                class="inline-flex items-center gap-1"
                :class="column.sortable ? 'cursor-pointer hover:text-slate-900' : 'cursor-default'"
                @click="onSort(String(column.key), column.sortable)"
              >
                {{ column.label }}
                <span v-if="column.sortable && sortBy === String(column.key)">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading" class="divide-y">
          <tr v-for="idx in 8" :key="idx">
            <td v-for="col in columns" :key="String(col.key)" class="px-4 py-3">
              <Skeleton class="h-4 w-full" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="rows.length === 0">
          <tr>
            <td :colspan="columns.length" class="px-4 py-14 text-center text-slate-500">{{ emptyLabel }}</td>
          </tr>
        </tbody>

        <tbody v-else class="divide-y">
          <tr
            v-for="(row, index) in rows"
            :key="index"
            :class="[
              'hover:bg-slate-50/70',
              rowClickable ? 'cursor-pointer transition-colors focus-within:bg-slate-50/70' : '',
            ]"
            @click="onRowClick(row)"
          >
            <td v-for="column in columns" :key="String(column.key)" class="px-4 py-3 text-slate-700">
              {{
                column.format
                  ? column.format(row[column.key], row)
                  : (row[column.key] as string | number | undefined)
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between border-t border-border px-4 py-3">
      <p class="text-xs text-slate-500">Pagina {{ page }} de {{ totalPages }}</p>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="emit('change-page', page - 1)">
          Anterior
        </Button>
        <Button variant="outline" size="sm" :disabled="page >= totalPages" @click="emit('change-page', page + 1)">
          Proxima
        </Button>
      </div>
    </div>
  </div>
</template>
