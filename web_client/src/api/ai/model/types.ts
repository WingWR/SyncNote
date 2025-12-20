// 导入统一的ApiResponse类型
export type { ApiResponse } from '../chat/types'

export interface AIModel {
  id: string
  name: string
  provider: string
}
