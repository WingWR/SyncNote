import type { User } from '../../stores/user/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  avatar?: string
}

// 如果需要，可以导出 User
export type { User }
