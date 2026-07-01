<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  ArrowUpDownIcon,
  EyeIcon,
  FilterIcon,
  PencilLineIcon,
  Trash2Icon,
  SearchIcon,
} from '@lucide/vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useFinanceStore } from '@/stores/finance'
import type { ParsedTransactionInput, Transaction } from '@/types/finance'
import { currency, dateLabel } from '@/utils/format'

const finance = useFinanceStore()
const loading = ref(true)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 800)
})

const filters = reactive({
  description: '',
  year: String(new Date().getFullYear()),
  type: 'Todos',
})

const sort = reactive({
  field: 'date' as 'date' | 'description' | 'category' | 'type' | 'amount' | 'paymentMethod',
  direction: 'desc' as 'asc' | 'desc',
})

const page = ref(1)
const pageSize = 6

const selected = ref<Transaction | null>(null)
const viewOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)

const editForm = reactive<ParsedTransactionInput>({
  amount: 0,
  category: 'Outros',
  type: 'Despesa',
  date: new Date().toISOString(),
  paymentMethod: 'Pix',
  description: '',
})

const years = computed(() => {
  const set = new Set(finance.transactions.map((item) => String(new Date(item.date).getFullYear())))
  return [String(new Date().getFullYear()), ...set]
})

const filtered = computed(() => {
  return finance.sortedTransactions.filter((item) => {
    const matchDescription = item.description.toLowerCase().includes(filters.description.toLowerCase())
    const matchYear = String(new Date(item.date).getFullYear()) === filters.year
    const matchType = filters.type === 'Todos' || item.type === filters.type
    return matchDescription && matchYear && matchType
  })
})

const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const modifier = sort.direction === 'asc' ? 1 : -1
    if (sort.field === 'amount') return (a.amount - b.amount) * modifier
    if (sort.field === 'date') return (+new Date(a.date) - +new Date(b.date)) * modifier
    return String(a[sort.field]).localeCompare(String(b[sort.field])) * modifier
  })
})

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

function sortBy(field: typeof sort.field) {
  if (sort.field === field) {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sort.field = field
    sort.direction = 'asc'
  }
}

function openView(item: Transaction) {
  selected.value = item
  viewOpen.value = true
}

function openEdit(item: Transaction) {
  selected.value = item
  Object.assign(editForm, item)
  editOpen.value = true
}

function saveEdit() {
  if (!selected.value) return
  finance.updateTransaction(selected.value.id, { ...editForm })
  editOpen.value = false
  toast.success('Despesa atualizada com sucesso.')
}

function askDelete(item: Transaction) {
  selected.value = item
  deleteOpen.value = true
}

function confirmDelete() {
  if (!selected.value) return
  finance.removeTransaction(selected.value.id)
  deleteOpen.value = false
  toast.success('Movimentacao excluida.')
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-[220px] flex-1">
        <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="filters.description" class="pl-9" placeholder="Buscar por descricao" />
      </div>

      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" class="gap-2">
            <FilterIcon class="size-4" /> Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-72 space-y-3">
          <div class="space-y-2">
            <Label>Ano</Label>
            <Select v-model="filters.year">
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="year in years" :key="year" :value="year">{{ year }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Tipo</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="n in 6" :key="n" class="h-12 w-full rounded-xl" />
    </div>

    <div v-else class="rounded-2xl border border-border/70 bg-card/80 p-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('date')">Data <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('description')">Descricao <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('type')">Tipo <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('amount')">Valor <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>Forma de pagamento</TableHead>
            <TableHead class="w-[80px] text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in paginated" :key="item.id" class="transition-colors hover:bg-secondary/70">
            <TableCell>{{ dateLabel(item.date) }}</TableCell>
            <TableCell>{{ item.description }}</TableCell>
            <TableCell>{{ item.category }}</TableCell>
            <TableCell>
              <Badge :variant="item.type === 'Receita' ? 'secondary' : 'destructive'">{{ item.type }}</Badge>
            </TableCell>
            <TableCell class="font-medium" :class="item.type === 'Receita' ? 'text-emerald-400' : 'text-red-400'">
              {{ item.type === 'Receita' ? '+' : '-' }}{{ currency(item.amount) }}
            </TableCell>
            <TableCell>{{ item.paymentMethod }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="icon-sm" variant="ghost">...</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-40">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <DropdownMenuItem @click="openView(item)">
                        <EyeIcon class="mr-2 size-4" /> Visualizar
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent>Detalhes da movimentacao</TooltipContent>
                  </Tooltip>
                  <DropdownMenuItem @click="openEdit(item)">
                    <PencilLineIcon class="mr-2 size-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="askDelete(item)">
                    <Trash2Icon class="mr-2 size-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>

          <TableEmpty v-if="!paginated.length" :colspan="7" class="py-14 text-center">
            <p class="text-sm text-muted-foreground">Nenhuma movimentacao encontrada para os filtros aplicados.</p>
          </TableEmpty>
        </TableBody>
      </Table>
    </div>

    <Pagination v-model:page="page" :items-per-page="pageSize" :total="sorted.length" :default-page="1" :sibling-count="1" show-edges>
      <PaginationContent v-slot="{ items }" class="justify-end">
        <PaginationPrevious />
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" />
        </template>
        <PaginationNext />
      </PaginationContent>
    </Pagination>

    <Dialog v-model:open="viewOpen">
      <DialogContent v-if="selected" class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da movimentacao</DialogTitle>
          <DialogDescription>Visualize os dados registrados.</DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <p class="text-muted-foreground">Descricao</p><p>{{ selected.description }}</p>
          <p class="text-muted-foreground">Categoria</p><p>{{ selected.category }}</p>
          <p class="text-muted-foreground">Tipo</p><p>{{ selected.type }}</p>
          <p class="text-muted-foreground">Valor</p><p>{{ currency(selected.amount) }}</p>
          <p class="text-muted-foreground">Data</p><p>{{ dateLabel(selected.date) }}</p>
          <p class="text-muted-foreground">Pagamento</p><p>{{ selected.paymentMethod }}</p>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar movimentacao</DialogTitle>
          <DialogDescription>Atualize os campos e salve.</DialogDescription>
        </DialogHeader>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="space-y-2 md:col-span-2">
            <Label>Descricao</Label>
            <Input v-model="editForm.description" />
          </div>
          <div class="space-y-2">
            <Label>Categoria</Label>
            <Input v-model="editForm.category" />
          </div>
          <div class="space-y-2">
            <Label>Valor</Label>
            <Input v-model.number="editForm.amount" type="number" min="0" step="0.01" />
          </div>
          <div class="space-y-2">
            <Label>Tipo</Label>
            <Select v-model="editForm.type">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Pagamento</Label>
            <Select v-model="editForm.paymentMethod">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Cartao de Credito">Cartao de Credito</SelectItem>
                <SelectItem value="Cartao de Debito">Cartao de Debito</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="editOpen = false">Cancelar</Button>
          <Button @click="saveEdit">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir movimentacao?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acao nao pode ser desfeita. A movimentacao sera removida da listagem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" @click="confirmDelete">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
