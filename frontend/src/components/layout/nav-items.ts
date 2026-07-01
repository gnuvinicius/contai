import {
  LayoutDashboardIcon,
  LogInIcon,
  ReceiptTextIcon,
  SettingsIcon,
  SparklesIcon,
  UserPlusIcon,
} from '@lucide/vue'

export const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
  { label: 'Despesas', to: '/despesas', icon: ReceiptTextIcon },
  { label: 'Nova Entrada', to: '/nova-entrada', icon: SparklesIcon },
  { label: 'Configuracoes', to: '/configuracoes', icon: SettingsIcon },
]

export const authNavItems = [
  { label: 'Entrar', to: '/login', icon: LogInIcon },
  { label: 'Criar conta', to: '/register', icon: UserPlusIcon },
]
