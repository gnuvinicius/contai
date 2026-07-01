<script setup lang="ts">
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { SparklesIcon, LoaderCircleIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { parseNaturalLanguageEntry } from '@/services/nlp'
import { useFinanceStore } from '@/stores/finance'
import type { ParsedTransactionInput } from '@/types/finance'

const finance = useFinanceStore()

const examples = [
  'Hoje gastei R$ 120 no supermercado usando Pix.',
  'Recebi meu salario.',
  'Paguei R$ 45 de Uber.',
]

const prompt = ref('')
const parsing = ref(false)
const parsed = ref<ParsedTransactionInput | null>(null)

const form = reactive<ParsedTransactionInput>({
  amount: 0,
  category: 'Outros',
  type: 'Despesa',
  date: new Date().toISOString(),
  paymentMethod: 'Pix',
  description: '',
})

function applyExample(text: string) {
  prompt.value = text
}

async function processEntry() {
  if (!prompt.value.trim()) {
    toast.error('Descreva uma movimentacao antes de processar.')
    return
  }

  parsing.value = true
  parsed.value = null

  try {
    const result = await parseNaturalLanguageEntry(prompt.value)
    parsed.value = result
    Object.assign(form, result)
    toast.success('Interpretacao pronta. Revise os campos antes de salvar.')
  } catch {
    toast.error('Nao foi possivel processar a entrada agora.')
  } finally {
    parsing.value = false
  }
}

function saveEntry() {
  finance.addTransaction({ ...form })
  toast.success('Movimentacao salva com sucesso.')
  prompt.value = ''
  parsed.value = null
}

function cancelEntry() {
  parsed.value = null
  toast.info('Edicao cancelada.')
}

function newEntry() {
  prompt.value = ''
  parsed.value = null
  Object.assign(form, {
    amount: 0,
    category: 'Outros',
    type: 'Despesa',
    date: new Date().toISOString(),
    paymentMethod: 'Pix',
    description: '',
  })
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <Card class="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-xl">
          <SparklesIcon class="size-5 text-primary" /> Entrada por Linguagem Natural
        </CardTitle>
        <CardDescription>Descreva sua movimentacao financeira...</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Textarea
          v-model="prompt"
          class="min-h-40 resize-none"
          placeholder="Descreva sua movimentacao financeira..."
        />

        <div class="flex flex-wrap gap-2">
          <Button v-for="example in examples" :key="example" variant="outline" size="sm" @click="applyExample(example)">
            {{ example }}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button class="ml-auto" :disabled="parsing" @click="processEntry">
          <LoaderCircleIcon v-if="parsing" class="mr-2 size-4 animate-spin" />
          Processar
        </Button>
      </CardFooter>
    </Card>

    <Transition name="fade-up" mode="out-in">
      <Card v-if="parsing" key="loading" class="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle>Interpretando entrada...</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <Skeleton class="h-10 w-full rounded-xl" />
          <Skeleton class="h-10 w-full rounded-xl" />
          <Skeleton class="h-10 w-full rounded-xl" />
          <Skeleton class="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>

      <Card v-else-if="parsed" key="result" class="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle>Interpretacao da IA</CardTitle>
          <CardDescription>Edite os campos se necessario antes de confirmar.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="amount">Valor</Label>
            <Input id="amount" v-model.number="form.amount" type="number" min="0" step="0.01" />
          </div>

          <div class="space-y-2">
            <Label for="category">Categoria</Label>
            <Input id="category" v-model="form.category" />
          </div>

          <div class="space-y-2">
            <Label>Tipo</Label>
            <Select v-model="form.type">
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
            <Label for="date">Data</Label>
            <Input id="date" v-model="form.date" type="datetime-local" />
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label>Forma de pagamento</Label>
            <Select v-model="form.paymentMethod">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Cartao de Credito">Cartao de Credito</SelectItem>
                <SelectItem value="Cartao de Debito">Cartao de Debito</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label for="description">Descricao</Label>
            <Textarea id="description" v-model="form.description" class="min-h-28" />
          </div>
        </CardContent>
        <Separator class="bg-border/80" />
        <CardFooter class="justify-end gap-2 pt-4">
          <Button variant="ghost" @click="cancelEntry">Cancelar</Button>
          <Button variant="outline" @click="newEntry">Nova entrada</Button>
          <Button @click="saveEntry">Salvar</Button>
        </CardFooter>
      </Card>
    </Transition>
  </section>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
