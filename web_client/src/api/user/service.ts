import api from '../index'
import type { User, LoginRequest, RegisterRequest, UpdateUserRequest } from './types'

export function login(data: LoginRequest) {
  return api.post<{ user: User; token: string }>('/auth/login', data)
}

export function register(data: RegisterRequest) {
  return api.post<{ user: User; token: string }>('/auth/register', data)
}

export function getCurrentUser() {
  return api.get<User>('/user/me')
}

export function updateUser(data: UpdateUserRequest) {
  return api.put<User>('/user/me', data)
}

export function logout() {
  return api.post('/auth/logout')
}
