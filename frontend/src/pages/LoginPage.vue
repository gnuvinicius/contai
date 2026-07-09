<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const formError = ref<string | null>(route.query.created === '1' ? 'Conta criada. Entre com suas credenciais.' : null)

async function submit() {
  formError.value = null

  try {
    await auth.login(form)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch {
    formError.value = auth.error ?? 'Nao foi possivel entrar.'
  }
}
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(180deg,_#07111e_0%,_#0b1627_100%)] px-4 py-10 text-slate-100">
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
      <div class="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section class="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div class="space-y-4">
            <p class="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Contai Service</p>
            <h1 class="max-w-lg text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Entre para acompanhar suas movimentações reais.
            </h1>
          </div>
        </section>

        <Card class="border-white/10 bg-slate-950/90 text-slate-100 shadow-2xl shadow-black/40">
          <CardHeader class="space-y-2">
            <CardTitle class="text-2xl">Entrar</CardTitle>
            <CardDescription class="text-slate-400">Use suas credenciais para acessar o painel.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="username">Usuario</Label>
              <Input id="username" v-model="form.username" autocomplete="username" placeholder="seu_usuario" />
            </div>

            <div class="space-y-2">
              <Label for="password">Senha</Label>
              <Input id="password" v-model="form.password" type="password" autocomplete="current-password" placeholder="••••••••" />
            </div>

            <p v-if="formError" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {{ formError }}
            </p>

            <Button class="w-full" :disabled="auth.loading" @click="submit">
              {{ auth.loading ? 'Entrando...' : 'Entrar' }}
            </Button>

            <p class="text-sm text-slate-400">
              Ainda não tem conta?
              <RouterLink class="text-emerald-300 underline-offset-4 hover:underline" to="/register">Criar usuário</RouterLink>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </main>
</template>
