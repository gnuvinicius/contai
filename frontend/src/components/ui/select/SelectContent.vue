<script setup lang="ts">
import {
  SelectContent,
  SelectPortal,
  SelectViewport,
  type SelectContentProps,
  useForwardProps,
} from 'radix-vue'

import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<SelectContentProps & { class?: string }>(), {
  position: 'popper',
})

const forwardedProps = useForwardProps(props)
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwardedProps"
      :class="
        cn(
          'relative z-[100] max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-white text-slate-900 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
          props.class,
        )
      "
    >
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
