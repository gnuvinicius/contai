<script setup lang="ts">
import { RouterLink } from 'vue-router'

import Button from '@/components/ui/Button.vue'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
      <p class="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Erro 404</p>
      <h1 class="mt-3 text-3xl font-semibold text-slate-900">Pagina nao encontrada</h1>
      <p class="mt-2 text-sm text-slate-500">O caminho informado nao existe ou foi movido.</p>

      <RouterLink to="/dashboard" class="mt-6 inline-flex">
        <Button>Voltar ao dashboard</Button>
      </RouterLink>
    </div>
  </div>
</template>
