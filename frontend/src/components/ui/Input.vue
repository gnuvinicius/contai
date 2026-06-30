<script setup lang="ts">
import { cn } from '@/utils/cn'

interface InputProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  class?: string
  autocomplete?: string
  id?: string
  name?: string
}

withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  class: '',
  autocomplete: 'off',
  id: undefined,
  name: undefined,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :class="
      cn(
        'h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20',
        $props.class,
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
