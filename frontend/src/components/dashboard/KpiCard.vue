<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

defineProps<{
  title: string
  value: string
  hint: string
  icon: Component
  tone?: 'default' | 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <Card class="border-border/70 bg-card/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-secondary/70">
    <CardHeader class="pb-3">
      <CardTitle class="flex items-center justify-between text-sm font-medium text-muted-foreground">
        {{ title }}
        <span
          class="inline-flex size-8 items-center justify-center rounded-lg"
          :class="{
            'bg-primary/20 text-primary': tone === 'default' || !tone,
            'bg-emerald-500/15 text-emerald-400': tone === 'success',
            'bg-amber-500/15 text-amber-400': tone === 'warning',
            'bg-red-500/15 text-red-400': tone === 'danger',
          }"
        >
          <component :is="icon" class="size-4" />
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-2xl font-semibold tracking-tight text-foreground">{{ value }}</p>
      <p class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    </CardContent>
  </Card>
</template>
