<script setup lang="ts">
import { Menu } from '@lucide/vue'

import Button from '@/components/ui/Button.vue'
import type { User } from '@/types/auth'

defineProps<{
  user: User
  onOpenSidebar: () => void
}>()
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur lg:px-6">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="sm" class="lg:hidden" @click="onOpenSidebar">
        <Menu class="h-4 w-4" />
      </Button>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Painel</p>
        <h1 class="text-sm font-semibold text-slate-800">Controle Financeiro Pessoal</h1>
      </div>
    </div>

    <div class="flex items-center gap-3 rounded-full border border-border bg-slate-50 px-3 py-1.5">
      <div class="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-tr from-[#0A66C2] to-[#3FA1FF]" />
      <div class="text-right">
        <p class="text-sm font-semibold text-slate-800">{{ user.firstName }} {{ user.lastName }}</p>
        <p class="text-xs text-slate-500">{{ user.email }}</p>
      </div>
    </div>
  </header>
</template>
