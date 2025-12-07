import api from './index'

export interface AIChatRequest {
  message: string
  documentId?: number
  modelId: string
  mode: 'chat' | 'agent'
  context?: string
}

export interface AIChatResponse {
  message: string
  context?: string
}

export const aiApi = {
  chat(data: AIChatRequest) {
    return api.post<AIChatResponse>('/ai/chat', data)
  },

  getModels() {
    return api.get<Array<{ id: string; name: string; provider: string }>>('/ai/models')
  }
}


