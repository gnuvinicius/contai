import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          meta: { title: 'Dashboard' },
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: '/despesas',
          name: 'despesas',
          meta: { title: 'Despesas' },
          component: () => import('@/pages/ExpensesPage.vue'),
        },
        {
          path: '/nova-entrada',
          name: 'nova-entrada',
          meta: { title: 'Nova Entrada' },
          component: () => import('@/pages/NaturalEntryPage.vue'),
        },
        {
          path: '/configuracoes',
          name: 'configuracoes',
          meta: { title: 'Configuracoes' },
          component: () => import('@/pages/SettingsPage.vue'),
        },
      ],
    },
  ],
})

export default router
