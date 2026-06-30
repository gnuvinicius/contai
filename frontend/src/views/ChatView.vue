<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { useToast } from '@/composables/useToast'
import { useChatStore } from '@/stores/chat'
import { sanitizeText } from '@/utils/sanitize'

const chatStore = useChatStore()
const { error } = useToast()
const message = ref('')
const container = ref<HTMLElement | null>(null)

watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick()
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  },
)

watch(
  () => chatStore.error,
  (value) => {
    if (value) {
      error(value)
    }
  },
)

async function send(): Promise<void> {
  const content = sanitizeText(message.value)
  if (!content) {
    return
  }

  message.value = ''
  await chatStore.sendMessage(content)
}
</script>

<template>
  <section class="flex h-[calc(100vh-8.5rem)] flex-col">
    <div>
      <h2 class="text-2xl font-semibold text-slate-900">Assistente Financeiro</h2>
      <p class="mt-1 text-sm text-slate-500">Registre gastos com linguagem natural e confirme os dados processados pela API.</p>
    </div>

    <div
      ref="container"
      class="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-white p-4"
      role="log"
      aria-live="polite"
    >
      <p v-if="chatStore.messages.length === 0" class="rounded-md border border-dashed border-border bg-slate-50 p-4 text-sm text-slate-500">
        Exemplo: Comprei um hamburguer no McDonalds por R$ 35 no cartao de credito.
      </p>

      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="max-w-[85%] rounded-lg px-4 py-3 text-sm"
        :class="msg.role === 'user' ? 'ml-auto bg-primary text-white' : 'bg-slate-100 text-slate-700'"
      >
        <p>{{ msg.content }}</p>

        <div v-if="msg.parsedExpense" class="mt-3 rounded-md border border-slate-300 bg-white/80 p-3 text-xs text-slate-700">
          <p><strong>Descricao:</strong> {{ msg.parsedExpense.description }}</p>
          <p><strong>Valor:</strong> R$ {{ msg.parsedExpense.amount }}</p>
          <p><strong>Estabelecimento:</strong> {{ msg.parsedExpense.merchant }}</p>
          <p><strong>Pagamento:</strong> {{ msg.parsedExpense.paymentMethod }}</p>
          <p><strong>Categoria:</strong> {{ msg.parsedExpense.category }}</p>
        </div>
      </div>
    </div>

    <form class="mt-3 flex gap-2" @submit.prevent="send">
      <Input v-model="message" placeholder="Descreva seu gasto em linguagem natural..." />
      <Button type="submit" :loading="chatStore.isSending">Enviar</Button>
    </form>
  </section>
</template>
