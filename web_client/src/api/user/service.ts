import api from "../index";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
  LoginResponse,
  ApiResponse
} from "./types";

export function login(data: LoginRequest) {
  return api.post<ApiResponse<LoginResponse>>("/auth/login", data);
}

export function register(data: RegisterRequest) {
  return api.post<ApiResponse<null>>("/auth/register", data);
}

export function getCurrentUser() {
  return api.get<ApiResponse<User>>("/user/me");
}

export function updateUser(data: UpdateUserRequest) {
  return api.put<ApiResponse<User>>("/user/me", data);
}

export function logout() {
  return api.post<ApiResponse<null>>("/auth/logout");
}
