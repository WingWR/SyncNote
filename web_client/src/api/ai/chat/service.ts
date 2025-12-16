import api from '../../index'
import type { AIChatRequest, AIChatResponse } from './types'

export function chat(data: AIChatRequest) {
  return api.post<AIChatResponse>('/ai/chat', data)
}
