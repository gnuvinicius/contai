<script setup lang="ts">
import { LayoutDashboard, CreditCard, MessageCircle, UserCircle2, LogOut } from '@lucide/vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Gastos', to: '/expenses', icon: CreditCard },
  { label: 'Assistente Financeiro', to: '/chat', icon: MessageCircle },
  { label: 'Perfil', to: '/profile', icon: UserCircle2 },
]

defineProps<{
  onLogout: () => void
}>()
</script>

<template>
  <aside class="flex h-full w-full flex-col border-r border-border bg-white/90 p-4 backdrop-blur lg:w-[260px]">
    <nav class="flex-1 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition"
        :class="
          route.path.startsWith(item.to)
            ? 'bg-secondary text-secondary-foreground'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        "
      >
        <component :is="item.icon" class="h-4 w-4" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <button
      class="mt-3 inline-flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
      @click="onLogout"
    >
      <LogOut class="h-4 w-4" />
      Logout
    </button>
  </aside>
</template>
