export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export type AIMode = 'chat' | 'agent'