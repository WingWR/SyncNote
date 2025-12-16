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
