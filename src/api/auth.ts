import http from './http'

export interface LoginPayload {
  username: string
  password: string
}

export interface Admin {
  id: string
  username: string
  email: string
  role: string
  fullName: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface LoginData {
  accessToken: string
  admin: Admin
}

export const authApi = {
  login(payload: LoginPayload) {
    return http.post<ApiResponse<LoginData>>('/auth/login', payload)
  },

  me() {
    return http.get<ApiResponse<Admin>>('/auth/me')
  },
}
