<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function save() {
  toast.success('Configuracoes salvas.')
}
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-4">
    <Card class="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle>Perfil e preferencias</CardTitle>
        <CardDescription>Configure informacoes basicas da sua conta.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Nome</Label>
          <Input value="Joao" />
        </div>

        <div class="space-y-2">
          <Label>Email</Label>
          <Input value="joao@email.com" />
        </div>

        <div class="space-y-2">
          <Label>Observacoes</Label>
          <Textarea class="min-h-28" placeholder="Anotacoes para sua organizacao financeira" />
        </div>

        <div class="flex justify-end">
          <Button @click="save">Salvar alteracoes</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
