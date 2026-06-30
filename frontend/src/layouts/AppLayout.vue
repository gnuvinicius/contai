<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { success } = useToast()

const showMobileSidebar = ref(false)
const confirmLogoutOpen = ref(false)

const user = computed(() => authStore.user)

function requestLogout(): void {
  confirmLogoutOpen.value = true
}

function logout(): void {
  authStore.clearSession()
  success('Sessao encerrada com sucesso.')
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-transparent">
    <div class="hidden lg:block">
      <AppSidebar :on-logout="requestLogout" />
    </div>

    <div v-if="showMobileSidebar" class="fixed inset-0 z-50 flex lg:hidden">
      <div class="w-[280px] bg-white">
        <AppSidebar
          :on-logout="() => {
            requestLogout()
            showMobileSidebar = false
          }"
        />
      </div>
      <button class="flex-1 bg-slate-900/30" @click="showMobileSidebar = false" />
    </div>

    <div class="flex min-h-screen flex-1 flex-col">
      <AppHeader
        v-if="user"
        :user="user"
        :on-open-sidebar="() => {
          showMobileSidebar = true
        }"
      />

      <main class="flex-1 p-4 sm:p-6">
        <div class="mx-auto max-w-7xl animate-fade-in-up">
          <RouterView />
        </div>
      </main>
    </div>

    <ConfirmDialog
      v-model:open="confirmLogoutOpen"
      title="Deseja sair da conta?"
      description="Voce precisara fazer login novamente para acessar seus dados."
      confirm-label="Sair"
      @confirm="logout"
    />
  </div>
</template>
