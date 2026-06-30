<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4 sm:p-8">
    <div class="grid w-full max-w-6xl overflow-hidden rounded-3xl border bg-white shadow-soft lg:grid-cols-[1.15fr_1fr]">
      <section class="hidden bg-gradient-to-br from-[#0E2A47] via-[#134C84] to-[#0A66C2] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="text-sm uppercase tracking-[0.2em] text-blue-100/90">Contai SaaS</p>
          <h1 class="mt-4 text-4xl font-semibold leading-tight">Controle sua vida financeira com clareza e velocidade.</h1>
          <p class="mt-4 max-w-md text-blue-100/90">
            Uma experiencia moderna inspirada nos melhores produtos SaaS para monitorar gastos, tendencias e decisoes.
          </p>
        </div>

        <p class="max-w-md text-sm text-blue-100/80">
          Dashboard inteligente, organizacao por categorias e assistente de linguagem natural para registrar despesas.
        </p>
      </section>

      <section class="bg-white p-6 sm:p-10">
        <RouterLink to="/login" class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary">
          <span class="h-2 w-2 rounded-full bg-primary" />
          Contai
        </RouterLink>

        <slot />
      </section>
    </div>
  </div>
</template>
