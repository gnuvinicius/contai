<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currency } from '@/utils/format';
import { computed } from 'vue';

const props = defineProps<{
  values: Array<{ label: string; value: number }>
}>()

const palette = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#64748B', '#0EA5E9']

const total = computed(() => props.values.reduce((acc, item) => acc + item.value, 0) || 1)

const gradient = computed(() => {
  let cursor = 0
  const slices = props.values.map((item, idx) => {
    const ratio = (item.value / total.value) * 100
    const start = cursor
    const end = cursor + ratio
    cursor = end
    return `${palette[idx % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
  })

  return `conic-gradient(${slices.join(', ')})`
})
</script>

<template>
  <Card class="border-border/70 bg-card/80">
    <CardHeader>
      <CardTitle class="text-sm font-medium text-muted-foreground">Distribuicao por forma de pagamento</CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="mx-auto size-44 rounded-full border border-border/70" :style="{ background: gradient }" />

      <div class="space-y-2">
        <div v-for="(item, idx) in values" :key="item.label" class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full" :style="{ backgroundColor: palette[idx % palette.length] }" />
            <span class="text-muted-foreground">{{ item.label }}</span>
          </div>
          <span class="font-medium text-foreground">{{ currency(item.value) }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
