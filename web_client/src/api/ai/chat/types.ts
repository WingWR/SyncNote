// 统一的API响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface AIChatRequest {
  message: string
  documentId?: string
  modelId: string
  mode: 'chat' | 'polish' | 'continue'
  context?: string
}

export interface AIChatResponse {
  message: string
  context?: string
}

// 流式输出相关类型
export interface AIStreamChunk {
  type: 'chunk' | 'done' | 'error'
  content: string
  done: boolean
}

export interface AIStreamCallbacks {
  onChunk: (chunk: AIStreamChunk) => void
  onComplete: () => void
  onError: (error: Error) => void
}
