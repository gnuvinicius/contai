<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

interface Props {
  open: boolean
  title?: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  submitDisabled?: boolean
  submitLoading?: boolean
  drawerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Editar registro',
  description: '',
  submitLabel: 'Salvar',
  cancelLabel: 'Cancelar',
  submitDisabled: false,
  submitLoading: false,
  drawerClass: '',
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'submit'): void
  (event: 'cancel'): void
}>()

function close(): void {
  emit('cancel')
  emit('update:open', false)
}

function submit(): void {
  emit('submit')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="['drawer-overlay', props.drawerClass]" @click.self="close">
      <aside class="drawer-panel">
        <header class="drawer-header">
          <h3 class="drawer-title">{{ title }}</h3>
          <p v-if="description" class="drawer-description">{{ description }}</p>
        </header>

        <div class="drawer-content">
          <slot />
        </div>

        <footer class="drawer-footer">
          <Button variant="outline" @click="close">{{ cancelLabel }}</Button>
          <Button :disabled="submitDisabled" :loading="submitLoading" @click="submit">{{ submitLabel }}</Button>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>