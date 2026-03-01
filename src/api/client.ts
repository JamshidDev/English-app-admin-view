import http from './http'
import type { ApiResponse, PaginatedData, PaginationParams } from './types'

export interface Client {
  id: string
  firstName: string
  lastName: string | null
  telegramId: string
  phone: string | null
  blockedAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateClientDto {
  firstName: string
  telegramId: string
  lastName?: string
  phone?: string
}

export interface UpdateClientDto {
  firstName?: string
  lastName?: string
  phone?: string
}

export interface ClientParams extends PaginationParams {
  blocked?: boolean
}

export const clientApi = {
  getAll(params?: ClientParams) {
    return http.get<ApiResponse<PaginatedData<Client>>>('/clients', { params })
  },

  getById(id: string) {
    return http.get<ApiResponse<Client>>(`/clients/${id}`)
  },

  create(data: CreateClientDto) {
    return http.post<ApiResponse<Client>>('/clients', data)
  },

  update(id: string, data: UpdateClientDto) {
    return http.put<ApiResponse<Client>>(`/clients/${id}`, data)
  },

  delete(id: string) {
    return http.delete<ApiResponse<null>>(`/clients/${id}`)
  },

  toggleBlock(id: string) {
    return http.patch<ApiResponse<Client>>(`/clients/${id}/toggle-block`)
  },
}
