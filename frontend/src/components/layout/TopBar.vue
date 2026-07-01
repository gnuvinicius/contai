<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'
import { BellIcon, LogOutIcon, SearchIcon, Settings2Icon, UserRoundIcon } from '@lucide/vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const title = computed(() => String(route.meta.title ?? 'Dashboard'))

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur-lg md:px-8">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <slot name="left" />
        <h1 class="text-lg font-semibold tracking-tight text-foreground md:text-xl">{{ title }}</h1>
      </div>

      <div class="hidden items-center gap-2 lg:flex">
        <div class="relative w-72">
          <SearchIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input class="h-9 pl-9" placeholder="Buscar movimentacoes..." />
        </div>
        <button
          class="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          type="button"
        >
          <BellIcon class="size-4" />
        </button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            class="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/70 px-2 py-1.5 transition-colors hover:bg-accent"
            type="button"
          >
            <Avatar class="size-8">
              <AvatarFallback class="bg-primary/25 text-xs text-primary">{{ initials(auth.displayName) || 'U' }}</AvatarFallback>
            </Avatar>
            <span class="hidden text-sm text-foreground sm:block">{{ auth.displayName }}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="flex items-center justify-between">
            Minha Conta
            <Badge variant="secondary" class="text-[10px]">user</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserRoundIcon class="mr-2 size-4" /> Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings2Icon class="mr-2 size-4" /> Preferencias
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive" @click="logout">
            <LogOutIcon class="mr-2 size-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RouterLink to="/">Home</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ title }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </header>
</template>
