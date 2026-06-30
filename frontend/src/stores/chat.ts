import { ref } from 'vue'
import { defineStore } from 'pinia'

import { ChatService } from '@/services/chat.service'
import type { ChatMessage } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isSending = ref(false)
  const error = ref<string | null>(null)

  async function sendMessage(content: string): Promise<void> {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    messages.value.push(userMessage)
    isSending.value = true
    error.value = null

    try {
      const response = await ChatService.parseExpense(content)

      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        parsedExpense: response.parsedExpense,
        createdAt: new Date().toISOString(),
      })
    } catch {
      error.value = 'Nao foi possivel processar sua mensagem.'
    } finally {
      isSending.value = false
    }
  }

  return { messages, isSending, error, sendMessage }
})
