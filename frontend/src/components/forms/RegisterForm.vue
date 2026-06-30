<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { sanitizeText } from '@/utils/sanitize'

const schema = toTypedSchema(
  z.object({
    username: z.string().min(3, 'Username deve ter no minimo 3 caracteres.'),
    password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres.'),
    firstName: z.string().min(2, 'Primeiro nome deve ter no minimo 2 caracteres.'),
    lastName: z.string().min(2, 'Sobrenome deve ter no minimo 2 caracteres.'),
    email: z.string().email('Digite um email valido.'),
  }),
)

const emit = defineEmits<{
  (event: 'submit', value: {
    username: string
    password: string
    firstName: string
    lastName: string
    email: string
  }): void
}>()

const { values, errors, handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  },
})

const onSubmit = handleSubmit((formValues) => {
  emit('submit', {
    username: sanitizeText(formValues.username),
    password: formValues.password,
    firstName: sanitizeText(formValues.firstName),
    lastName: sanitizeText(formValues.lastName),
    email: sanitizeText(formValues.email),
  })
})

defineProps<{
  loading: boolean
}>()
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700" for="register-first-name">Primeiro Nome</label>
        <Input id="register-first-name" v-model="values.firstName" placeholder="Ana" autocomplete="given-name" />
        <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">{{ errors.firstName }}</p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700" for="register-last-name">Sobrenome</label>
        <Input id="register-last-name" v-model="values.lastName" placeholder="Silva" autocomplete="family-name" />
        <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">{{ errors.lastName }}</p>
      </div>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="register-username">Username</label>
      <Input id="register-username" v-model="values.username" placeholder="ana.silva" autocomplete="username" />
      <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="register-email">Email</label>
      <Input id="register-email" v-model="values.email" type="email" placeholder="ana@email.com" autocomplete="email" />
      <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="register-password">Password</label>
      <Input
        id="register-password"
        v-model="values.password"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
      />
      <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
    </div>

    <Button type="submit" class="w-full" :loading="loading">Criar conta</Button>
  </form>
</template>
