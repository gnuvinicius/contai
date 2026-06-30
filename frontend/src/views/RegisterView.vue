<script setup lang="ts">
import axios from 'axios'
import { RouterLink, useRouter } from 'vue-router'

import RegisterForm from '@/components/forms/RegisterForm.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { success, error } = useToast()

async function handleRegister(payload: {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
}): Promise<void> {
  try {
    await authStore.register(payload)
    success('Conta criada com sucesso.')
    router.push('/dashboard')
  } catch (err) {
    if (axios.isAxiosError(err)) {
      error('Falha ao criar conta.', err.response?.data?.message ?? 'Revise os dados informados.')
      return
    }
    error('Falha ao criar conta.')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="mx-auto max-w-md">
      <h2 class="text-3xl font-semibold text-slate-900">Criar conta</h2>
      <p class="mt-2 text-sm text-slate-500">Configure seu acesso em poucos passos.</p>

      <div class="mt-8">
        <RegisterForm :loading="authStore.isLoading" @submit="handleRegister" />
      </div>

      <p class="mt-6 text-sm text-slate-500">
        Ja possui conta?
        <RouterLink to="/login" class="font-semibold text-primary hover:underline">Entrar</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
