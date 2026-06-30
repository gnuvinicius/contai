import { http } from '@/api/http'
import type { ChatResponse } from '@/types/chat'

export const ChatService = {
  async parseExpense(content: string): Promise<ChatResponse> {
    const { data } = await http.post<ChatResponse>('/chat/parse-expense', {
      message: content,
    })

    return data
  },
}
