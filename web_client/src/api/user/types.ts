import type { User } from "../../stores/user/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;
}

export interface LoginResponse {
  userResponseOfLoginInfo: User;
  token: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type { User };
