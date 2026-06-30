<script setup lang="ts">
import { computed } from 'vue'

import Card from '@/components/ui/Card.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold text-slate-900">Perfil</h2>
    <p class="mt-1 text-sm text-slate-500">Informacoes do usuario autenticado.</p>

    <Card v-if="user" class="mt-5">
      <dl class="grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Username</dt>
          <dd class="mt-1 text-sm font-semibold text-slate-800">{{ user.username }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Email</dt>
          <dd class="mt-1 text-sm font-semibold text-slate-800">{{ user.email }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Primeiro Nome</dt>
          <dd class="mt-1 text-sm font-semibold text-slate-800">{{ user.firstName }}</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wide text-slate-500">Sobrenome</dt>
          <dd class="mt-1 text-sm font-semibold text-slate-800">{{ user.lastName }}</dd>
        </div>
      </dl>
    </Card>
  </section>
</template>
