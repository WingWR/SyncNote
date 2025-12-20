export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface AIChat {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export interface AIState {
  chats: AIChat[]
  currentChatId: string | null
  currentModel: AIModel
  availableModels: AIModel[]
  isLoading: boolean
  isStreaming: boolean
  mode: 'chat' | 'polish' | 'continue'
}