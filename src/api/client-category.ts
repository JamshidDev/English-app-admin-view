import http from './http'
import type { ApiResponse } from './types'

export interface ClientCategory {
  id: string
  clientId: string
  categoryId: string
  order: number
  createdAt: string
}

export interface CreateClientCategoryDto {
  clientId: string
  categoryId: string
  order?: number
}

export interface ReorderClientCategoriesDto {
  categoryIds: string[]
}

export const clientCategoryApi = {
  getByClient(clientId: string) {
    return http.get<ApiResponse<ClientCategory[]>>(`/client-categories/client/${clientId}`)
  },

  create(data: CreateClientCategoryDto) {
    return http.post<ApiResponse<ClientCategory>>('/client-categories', data)
  },

  reorder(clientId: string, data: ReorderClientCategoriesDto) {
    return http.put<ApiResponse<null>>(`/client-categories/client/${clientId}/reorder`, data)
  },

  delete(id: string) {
    return http.delete<ApiResponse<null>>(`/client-categories/${id}`)
  },
}
