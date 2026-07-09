<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
})

const formError = ref<string | null>(null)

async function submit() {
  formError.value = null

  try {
    await auth.register(form)
    await router.replace({ name: 'login', query: { created: '1' } })
  } catch {
    formError.value = auth.error ?? 'Nao foi possivel criar a conta.'
  }
}
</script>

<template>
  <main class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(180deg,_#07111e_0%,_#0b1627_100%)] px-4 py-10 text-slate-100">
    <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
      <div class="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card class="order-2 border-white/10 bg-slate-950/90 text-slate-100 shadow-2xl shadow-black/40 lg:order-1">
          <CardHeader class="space-y-2">
            <CardTitle class="text-2xl">Criar usuário</CardTitle>
            <CardDescription class="text-slate-400">
              O backend já adiciona o novo usuário ao grupo <span class="font-medium text-emerald-300">user</span>.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="firstName">Nome</Label>
                <Input id="firstName" v-model="form.first_name" autocomplete="given-name" placeholder="João" />
              </div>

              <div class="space-y-2">
                <Label for="lastName">Sobrenome</Label>
                <Input id="lastName" v-model="form.last_name" autocomplete="family-name" placeholder="Silva" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="username">Usuário</Label>
              <Input id="username" v-model="form.username" autocomplete="username" placeholder="joao_silva" />
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="form.email" type="email" autocomplete="email" placeholder="joao@email.com" />
            </div>

            <div class="space-y-2">
              <Label for="password">Senha</Label>
              <Input id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="••••••••" />
            </div>

            <p v-if="formError" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {{ formError }}
            </p>

            <Button class="w-full" :disabled="auth.loading" @click="submit">
              {{ auth.loading ? 'Criando...' : 'Criar conta' }}
            </Button>

            <p class="text-sm text-slate-400">
              Ja tem conta?
              <RouterLink class="text-emerald-300 underline-offset-4 hover:underline" to="/login">Entrar</RouterLink>
            </p>
          </CardContent>
        </Card>

        <section class="order-1 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl lg:order-2">
          <div class="space-y-4">
            <p class="text-sm uppercase tracking-[0.35em] text-sky-300/80">Cadastro</p>
            <h1 class="max-w-lg text-4xl font-semibold tracking-tight text-white md:text-5xl">
              A conta nasce pronta para operar com as permissoes do grupo user.
            </h1>
            <p class="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              O frontend nao altera o backend: ele apenas envia os dados para registro e redireciona para o login depois de criar o usuario.
            </p>
          </div>

          <div class="mt-10 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">Usuario novo</div>
            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">Grupo user</div>
            <div class="rounded-2xl border border-white/10 bg-black/20 p-4">Acesso por JWT</div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
