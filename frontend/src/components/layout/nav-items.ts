import {
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SparklesIcon,
  SettingsIcon,
} from '@lucide/vue'

export const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboardIcon },
  { label: 'Despesas', to: '/despesas', icon: ReceiptTextIcon },
  { label: 'Nova Entrada', to: '/nova-entrada', icon: SparklesIcon },
  { label: 'Configuracoes', to: '/configuracoes', icon: SettingsIcon },
]
