<script setup lang="ts">
import axios from 'axios'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import LoginForm from '@/components/forms/LoginForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

async function handleLogin(payload: { username: string; password: string }): Promise<void> {
  try {
    await authStore.login(payload)
    success('Login realizado com sucesso.')
    const redirectTo = (route.query.redirect as string) || '/dashboard'
    router.push(redirectTo)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      error('Falha ao autenticar.', err.response?.data?.message ?? 'Verifique suas credenciais.')
      return
    }
    error('Falha ao autenticar.')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="mx-auto max-w-md">
      <h2 class="text-3xl font-semibold text-slate-900">Entrar</h2>
      <p class="mt-2 text-sm text-slate-500">Acesse sua conta para continuar.</p>

      <div class="mt-8">
        <LoginForm :loading="authStore.isLoading" @submit="handleLogin" />
      </div>

      <p class="mt-6 text-sm text-slate-500">
        Ainda nao possui conta?
        <RouterLink to="/register" class="font-semibold text-primary hover:underline">Criar conta</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
