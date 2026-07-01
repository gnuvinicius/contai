<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const auth = useAuthStore()
const router = useRouter()

function save() {
  toast.success('Configuracoes salvas.')
}

function logout() {
  auth.logout()
  router.push('/login')
  toast.success('Sessao encerrada.')
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-4">
    <Card class="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle>Perfil e preferencias</CardTitle>
        <CardDescription>Conta autenticada no grupo user.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Usuario</Label>
          <Input :value="auth.displayName" readonly />
        </div>

        <div class="space-y-2">
          <Label>Roles</Label>
          <Input :value="auth.roles.join(', ') || 'user'" readonly />
        </div>

        <div class="space-y-2">
          <Label>Observacoes</Label>
          <Textarea class="min-h-28" placeholder="Anotacoes para sua organizacao financeira" />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <Button variant="outline" @click="logout">Sair</Button>
          <Button @click="save">Salvar alteracoes</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
