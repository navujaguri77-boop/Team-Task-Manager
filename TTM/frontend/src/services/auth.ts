import { apiClient } from "./api"

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "member"
  avatar_url?: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirm_password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    })
    return response.data
  },

  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/auth/register", {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get("/api/auth/me")
    return response.data
  },

  updateProfile: async (data: { name?: string; avatar_url?: string }): Promise<User> => {
    const response = await apiClient.put("/api/auth/profile", data)
    return response.data
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/api/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  },
}
