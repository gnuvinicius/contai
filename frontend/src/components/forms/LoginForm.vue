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
  }),
)

const emit = defineEmits<{
  (event: 'submit', value: { username: string; password: string }): void
}>()

const { errors, handleSubmit, defineField } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    password: '',
  },
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit((formValues) => {
  emit('submit', {
    username: sanitizeText(formValues.username),
    password: formValues.password,
  })
})

defineProps<{
  loading: boolean
}>()
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="login-username">Username</label>
      <Input
        id="login-username"
        v-model="username"
        v-bind="usernameAttrs"
        autocomplete="username"
        placeholder="seu.usuario"
      />
      <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="login-password">Password</label>
      <Input
        id="login-password"
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
      />
      <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
    </div>

    <Button type="submit" class="w-full" :loading="loading">Entrar</Button>
  </form>
</template>
