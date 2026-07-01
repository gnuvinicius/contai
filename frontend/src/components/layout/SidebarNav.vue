<script setup lang="ts">
import { navItems } from '@/components/layout/nav-items'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { LogOutIcon, Wallet2Icon } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="flex h-full w-full flex-col bg-card/70 px-4 pb-4 pt-5 backdrop-blur-sm">
    <div class="mb-4 flex items-center gap-3 px-1">
      <div class="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <Wallet2Icon class="size-5" />
      </div>
      <div>
        <p class="text-sm font-semibold tracking-wide text-foreground">ContaI</p>
        <p class="text-xs text-muted-foreground">Finance AI</p>
      </div>
    </div>

    <Separator class="bg-border/80" />

    <ScrollArea class="mt-4 flex-1">
      <nav class="space-y-1 pr-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200"
          :class="cn(
            currentPath === item.to
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground',
          )"
        >
          <component :is="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </ScrollArea>

    <div class="mt-4 space-y-3 rounded-xl border border-border/80 bg-secondary/60 p-3 text-xs text-muted-foreground">
      <div>
        <p class="text-foreground">{{ auth.displayName }}</p>
        <p class="mt-1">Roles: {{ auth.roles.join(', ') || 'user' }}</p>
      </div>
      <Button variant="outline" size="sm" class="w-full justify-start gap-2" @click="auth.logout(); router.push('/login')">
        <LogOutIcon class="size-4" /> Sair
      </Button>
    </div>
  </aside>
</template>
