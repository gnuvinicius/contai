<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { parseNaturalLanguageEntry } from '@/services/nlp'
import { useFinanceStore } from '@/stores/finance'
import type { ExtractedTransactionResponse } from '@/types/finance'
import { CheckCircle2Icon, LoaderCircleIcon, SparklesIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const finance = useFinanceStore()

const examples = [
  'Hoje gastei R$ 120 no supermercado usando Pix.',
  'Recebi meu salario.',
  'Paguei R$ 45 de Uber.',
]

const prompt = ref('')
const parsing = ref(false)
const created = ref<ExtractedTransactionResponse | null>(null)

const resultSummary = computed(() => {
  if (!created.value) return []

  const response = created.value.response as Record<string, unknown>

  return [
    { label: 'Descricao', value: String(response.description ?? '-') },
    { label: 'Estabelecimento', value: String(response.merchant_name ?? response.merchantName ?? '-') },
    { label: 'Tipo', value: String(response.type ?? '-') },
    { label: 'Valor', value: String(response.amount ?? '-') },
    { label: 'Data', value: String(response.due_date ?? response.dueDate ?? '-') },
    { label: 'Pagamento', value: String(response.payment_method ?? response.paymentMethod ?? '-') },
  ]
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
  created.value = null

  try {
    const result = await parseNaturalLanguageEntry(prompt.value)
    created.value = result
    await finance.loadTransactions(true)
    toast.success('Movimentacao criada com sucesso.')
  } catch {
    toast.error('Nao foi possivel processar a entrada agora.')
  } finally {
    parsing.value = false
  }
}

function newEntry() {
  prompt.value = ''
  created.value = null
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <Card class="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-xl">
          <SparklesIcon class="size-5 text-primary" /> Entrada por Linguagem Natural
        </CardTitle>
        <CardDescription>Descreva a movimentacao. O backend interpreta e cria o registro na base.</CardDescription>
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

      <Card v-else-if="created" key="result" class="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle class="flex items-center gap-2"><CheckCircle2Icon class="size-5 text-emerald-400" /> Movimentacao criada</CardTitle>
          <CardDescription>A resposta abaixo veio do backend e a lista foi atualizada.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4 md:grid-cols-2">
          <div v-for="item in resultSummary" :key="item.label" class="rounded-2xl border border-border/70 bg-secondary/40 p-4">
            <p class="text-xs uppercase tracking-[0.25em] text-muted-foreground">{{ item.label }}</p>
            <p class="mt-2 text-sm font-medium text-foreground">{{ item.value }}</p>
          </div>
        </CardContent>
        <Separator class="bg-border/80" />
        <CardFooter class="justify-end gap-2 pt-4">
          <Button variant="outline" @click="newEntry">Nova entrada</Button>
          <Button @click="finance.loadTransactions(true).then(() => toast.success('Lista atualizada.'))">Recarregar lista</Button>
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
