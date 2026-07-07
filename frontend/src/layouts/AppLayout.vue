<script setup lang="ts">
import SidebarNav from '@/components/layout/SidebarNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { MenuIcon } from '@lucide/vue'
import { onMounted, ref } from 'vue'

const open = ref(false)
const auth = useAuthStore()
const transactionsStore = useTransactionsStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    transactionsStore.loadTransactions().catch(() => undefined)
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="mx-auto flex min-h-screen max-w-[1600px]">
      <aside class="sticky top-0 hidden h-screen w-72 border-r border-border/70 md:block">
        <SidebarNav />
      </aside>

      <div class="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar>
          <template #left>
            <Sheet v-model:open="open">
              <SheetTrigger as-child>
                <Button variant="outline" size="icon-sm" class="md:hidden">
                  <MenuIcon class="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-72 p-0">
                <SidebarNav />
              </SheetContent>
            </Sheet>
          </template>
        </TopBar>

        <main class="flex-1 p-4 md:p-8">
          <RouterView v-slot="{ Component, route }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
