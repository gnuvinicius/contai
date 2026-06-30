<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <AppToaster rich-colors position="top-right" :visible-toasts="4" />
</template>
