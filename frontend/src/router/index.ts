import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { title: 'Entrar', requiresAuth: false },
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { title: 'Criar conta', requiresAuth: false },
      component: () => import('@/pages/RegisterPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          meta: { title: 'Dashboard', requiresAuth: true },
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: '/despesas',
          name: 'despesas',
          meta: { title: 'Despesas', requiresAuth: true },
          component: () => import('@/pages/ExpensesPage.vue'),
        },
        {
          path: '/nova-entrada',
          name: 'nova-entrada',
          meta: { title: 'Nova Entrada', requiresAuth: true },
          component: () => import('@/pages/NaturalEntryPage.vue'),
        },
        {
          path: '/configuracoes',
          name: 'configuracoes',
          meta: { title: 'Configuracoes', requiresAuth: true },
          component: () => import('@/pages/SettingsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.bootstrap()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)
  const publicOnly = to.name === 'login' || to.name === 'register'

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (publicOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
