<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Transaction } from '@/types/finance'
import { currency, dateLabel } from '@/utils/format'
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from '@lucide/vue'

function isIncome(type: string) {
  return /receita|income|credit/i.test(type)
}

defineProps<{
  items: Transaction[]
}>()
</script>

<template>
  <Card class="h-full border-border/70 bg-card/80">
    <CardHeader>
      <CardTitle class="text-sm font-medium text-muted-foreground">Ultimas movimentacoes</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea class="h-[360px] pr-3">
        <TransitionGroup name="list" tag="div" class="space-y-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="rounded-xl border border-border/70 bg-secondary/40 p-3 transition-colors hover:bg-secondary"
          >
            <div class="mb-2 flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-foreground">{{ item.merchantName || item.description }}</p>
                <p class="text-xs text-muted-foreground">{{ item.description }}</p>
              </div>
              <Badge :variant="isIncome(item.type) ? 'secondary' : 'destructive'" class="gap-1">
                <ArrowUpCircleIcon v-if="isIncome(item.type)" class="size-3.5" />
                <ArrowDownCircleIcon v-else class="size-3.5" />
                {{ item.type }}
              </Badge>
            </div>
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span>{{ dateLabel(item.dueDate) }}</span>
              <span class="font-semibold" :class="isIncome(item.type) ? 'text-emerald-400' : 'text-red-400'">
                {{ isIncome(item.type) ? '+' : '-' }}{{ currency(item.amount) }}
              </span>
            </div>
          </div>
        </TransitionGroup>
      </ScrollArea>
    </CardContent>
  </Card>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
