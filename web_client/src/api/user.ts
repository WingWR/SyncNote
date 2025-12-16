import api from './index'
import type { User } from '../stores/user/types'

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
  email?: string
  avatar?: string
}

export const userApi = {
  login(data: LoginRequest) {
    return api.post<{ user: User; token: string }>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return api.post<{ user: User; token: string }>('/auth/register', data)
  },

  getCurrentUser() {
    return api.get<User>('/user/me')
  },

  updateUser(data: UpdateUserRequest) {
    return api.put<User>('/user/me', data)
  },

  logout() {
    return api.post('/auth/logout')
  }
}


