<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  bars: Array<{ label: string; expense: number; percent: number }>
}>()
</script>

<template>
  <Card class="border-border/70 bg-card/80">
    <CardHeader>
      <CardTitle class="text-sm font-medium text-muted-foreground">Gastos por mes</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-6 gap-2 sm:gap-3">
        <div v-for="bar in bars" :key="bar.label" class="flex flex-col items-center gap-2">
          <div class="relative flex h-40 w-full items-end rounded-xl border border-border/60 bg-secondary/40 p-1">
            <div
              class="w-full rounded-lg bg-primary/80 transition-all duration-300 hover:bg-primary"
              :style="{ height: `${Math.max(bar.percent, 8)}%` }"
            />
          </div>
          <span class="text-xs text-muted-foreground">{{ bar.label }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
