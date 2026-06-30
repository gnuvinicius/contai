<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Confirmar acao',
  description: 'Deseja continuar?',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'confirm'): void
}>()

function close(): void {
  emit('update:open', false)
}

function confirm(): void {
  emit('confirm')
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
      <div class="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-soft">
        <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ description }}</p>

        <div class="mt-6 flex justify-end gap-2">
          <Button variant="outline" @click="close">{{ cancelLabel }}</Button>
          <Button variant="destructive" @click="confirm">{{ confirmLabel }}</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
