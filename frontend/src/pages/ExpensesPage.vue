<script setup lang="ts">
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
import { useTransactionsStore } from '@/stores/transactions'
import type { ParsedTransactionInput, Transaction } from '@/types/transactions'
import { fromDateTimeLocal, toDateTimeLocal } from '@/utils/datetime'
import { currency, dateLabel } from '@/utils/format'
import {
    ArrowUpDownIcon,
    EyeIcon,
    FilterIcon,
    PencilLineIcon,
    SearchIcon,
    Trash2Icon,
} from '@lucide/vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'

const transactionsStore = useTransactionsStore()
const loading = ref(true)

function isIncome(type: string) {
  return /receita|income|credit/i.test(type)
}

onMounted(async () => {
  await transactionsStore.loadTransactions(true)
  loading.value = false
})

const filters = reactive({
  description: '',
  year: String(new Date().getFullYear()),
  type: 'Todos',
  paymentMethod: 'Todos',
})

const sort = reactive({
  field: 'dueDate' as 'dueDate' | 'description' | 'merchantName' | 'type' | 'amount' | 'paymentMethod',
  direction: 'desc' as 'asc' | 'desc',
})

const page = ref(1)
const pageSize = 6

const selected = ref<Transaction | null>(null)
const viewOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)

type EditForm = Omit<ParsedTransactionInput, 'merchantName'> & {
  merchantName: string
}

const editForm = reactive<EditForm>({
  amount: 0,
  type: 'Despesa',
  description: '',
  merchantName: '',
  isInstallment: false,
  installment: null,
  installmentTotal: null,
  dueDate: new Date().toISOString(),
  paymentMethod: null,
})

const years = computed(() => {
  const set = new Set(transactionsStore.transactions.map((item) => String(new Date(item.dueDate).getFullYear())))
  return [String(new Date().getFullYear()), ...set]
})

const paymentMethods = computed(() => {
  const set = new Set(transactionsStore.transactions.map((item) => item.paymentMethod ?? 'Nao informado'))
  return ['Todos', ...set]
})

const filtered = computed(() => {
  return transactionsStore.sortedTransactions.filter((item) => {
    const matchDescription = item.description.toLowerCase().includes(filters.description.toLowerCase())
    const matchYear = String(new Date(item.dueDate).getFullYear()) === filters.year
    const matchType = filters.type === 'Todos' || item.type === filters.type
    const matchPayment = filters.paymentMethod === 'Todos' || (item.paymentMethod ?? 'Nao informado') === filters.paymentMethod
    return matchDescription && matchYear && matchType && matchPayment
  })
})

const sorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const modifier = sort.direction === 'asc' ? 1 : -1
    if (sort.field === 'amount') return (a.amount - b.amount) * modifier
    if (sort.field === 'dueDate') return (+new Date(a.dueDate) - +new Date(b.dueDate)) * modifier
    return String(a[sort.field] ?? '').localeCompare(String(b[sort.field] ?? '')) * modifier
  })
})

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.max(Math.ceil(sorted.value.length / pageSize), 1))

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
  Object.assign(editForm, {
    amount: item.amount,
    type: item.type,
    description: item.description,
    merchantName: item.merchantName ?? '',
    isInstallment: item.isInstallment,
    installment: item.installment,
    installmentTotal: item.installmentTotal,
    dueDate: toDateTimeLocal(item.dueDate),
    paymentMethod: item.paymentMethod,
  })
  editOpen.value = true
}

async function saveEdit() {
  if (!selected.value) return

  try {
    await transactionsStore.updateTransaction(selected.value.id, {
      ...editForm,
      merchantName: editForm.merchantName.trim() || null,
      dueDate: fromDateTimeLocal(editForm.dueDate),
    })
    editOpen.value = false
    transactionsStore.loadTransactions(true)
    toast.success('Movimentacao atualizada com sucesso.')
  } catch {
    toast.error('Nao foi possivel atualizar a movimentacao.')
  }
}

function askDelete(item: Transaction) {
  selected.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selected.value) return

  try {
    await transactionsStore.removeTransaction(selected.value.id)
    deleteOpen.value = false
    toast.success('Movimentacao excluida.')
  } catch {
    toast.error('Nao foi possivel excluir a movimentacao.')
  }
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

          <div class="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select v-model="filters.paymentMethod">
              <SelectTrigger>
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <div v-if="loading || transactionsStore.loading" class="space-y-2">
      <Skeleton v-for="n in 6" :key="n" class="h-12 w-full rounded-xl" />
    </div>

    <div v-else class="rounded-2xl border border-border/70 bg-card/80 p-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('dueDate')">Data <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('description')">Descricao <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
            <TableHead>
              <button class="inline-flex items-center gap-1" @click="sortBy('merchantName')">Estabelecimento <ArrowUpDownIcon class="size-3.5" /></button>
            </TableHead>
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
            <TableCell>{{ dateLabel(item.dueDate) }}</TableCell>
            <TableCell>{{ item.description }}</TableCell>
            <TableCell>{{ item.merchantName || '-' }}</TableCell>
            <TableCell>
              <Badge :variant="isIncome(item.type) ? 'secondary' : 'destructive'">{{ item.type }}</Badge>
            </TableCell>
            <TableCell class="font-medium" :class="isIncome(item.type) ? 'text-emerald-400' : 'text-red-400'">
              {{ isIncome(item.type) ? '+' : '-' }}{{ currency(item.amount) }}
            </TableCell>
            <TableCell>{{ item.paymentMethod || '-' }}</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button size="icon-sm" variant="ghost">...</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="openView(item)"><EyeIcon class="mr-2 size-4" /> Ver</DropdownMenuItem>
                  <DropdownMenuItem @click="openEdit(item)"><PencilLineIcon class="mr-2 size-4" /> Editar</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive" @click="askDelete(item)"><Trash2Icon class="mr-2 size-4" /> Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="flex items-center justify-between gap-3 px-2 py-4">
        <Button variant="outline" :disabled="page === 1" @click="page = Math.max(page - 1, 1)">Anterior</Button>
        <span class="text-sm text-muted-foreground">Pagina {{ page }} de {{ totalPages }}</span>
        <Button variant="outline" :disabled="page === totalPages" @click="page = Math.min(page + 1, totalPages)">Proxima</Button>
      </div>

      <div v-if="paginated.length === 0" class="px-4 pb-4">
        <TableEmpty>Sem movimentacoes para os filtros atuais.</TableEmpty>
      </div>
    </div>

    <Dialog v-model:open="viewOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da movimentacao</DialogTitle>
          <DialogDescription>{{ selected?.description }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-2 text-sm">
          <p><strong>Data:</strong> {{ selected && dateLabel(selected.dueDate) }}</p>
          <p><strong>Valor:</strong> {{ selected && currency(selected.amount) }}</p>
          <p><strong>Estabelecimento:</strong> {{ selected?.merchantName || '-' }}</p>
          <p><strong>Tipo:</strong> {{ selected?.type }}</p>
          <p><strong>Pagamento:</strong> {{ selected?.paymentMethod || '-' }}</p>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar movimentacao</DialogTitle>
          <DialogDescription>Atualize os campos permitidos pela API.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Data</Label>
            <Input v-model="editForm.dueDate" type="datetime-local" />
          </div>

          <div class="space-y-2">
            <Label>Descricao</Label>
            <Input v-model="editForm.description" />
          </div>

          <div class="space-y-2">
            <Label>Estabelecimento</Label>
            <Input v-model="editForm.merchantName" />
          </div>

          <div class="space-y-2">
            <Label>Tipo</Label>
            <Select v-model="editForm.type">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Receita">Receita</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Valor</Label>
            <Input v-model.number="editForm.amount" type="number" min="0" step="0.01" />
          </div>

          <div class="space-y-2 flex items-center gap-3 self-end rounded-2xl border border-border/70 bg-secondary/40 px-4 py-3">
            <input id="installment" v-model="editForm.isInstallment" type="checkbox" class="size-4 rounded border-border" />
            <Label for="installment" class="mb-0">Parcelado</Label>
          </div>
        </div>
        <Separator class="bg-border/80" />
        <DialogFooter class="justify-end gap-2 pt-4">
          <Button variant="ghost" @click="editOpen = false">Cancelar</Button>
          <Button @click="saveEdit">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir movimentacao?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acao muda o status no backend e remove o item da listagem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
