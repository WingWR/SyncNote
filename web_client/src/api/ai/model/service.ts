import api from '../../index'
import type { AIModel, ApiResponse } from './types'

export function getModels() {
  return api.get<ApiResponse<AIModel[]>>('/ai/models')
}
