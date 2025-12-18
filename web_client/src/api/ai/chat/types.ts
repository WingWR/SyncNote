export interface AIChatRequest {
  message: string
  documentId?: string
  modelId: string
  mode: 'chat' | 'agent'
  context?: string
}

export interface AIChatResponse {
  message: string
  context?: string
}
