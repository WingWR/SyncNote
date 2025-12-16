import api from '../../index'
import type { AIModel } from './types'

export function getModels() {
  return api.get<AIModel[]>('/ai/models')
}
