import { toast } from 'vue-sonner'

export function useToast() {
  const success = (message: string, description?: string): void => {
    toast.success(message, { description })
  }

  const error = (message: string, description?: string): void => {
    toast.error(message, { description })
  }

  const info = (message: string, description?: string): void => {
    toast.info(message, { description })
  }

  return { success, error, info }
}
