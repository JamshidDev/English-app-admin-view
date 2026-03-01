import http from './http'
import type { ApiResponse, PaginatedData, PaginationParams, TranslatedField } from './types'

export interface Category {
  id: string
  name: TranslatedField
  public: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateCategoryDto {
  name: TranslatedField
  public?: boolean
}

export interface UpdateCategoryDto {
  name?: TranslatedField
  public?: boolean
}

export interface CategoryParams extends PaginationParams {
  public?: boolean
}

export const categoryApi = {
  getAll(params?: CategoryParams) {
    return http.get<ApiResponse<PaginatedData<Category>>>('/categories', { params })
  },

  getById(id: string) {
    return http.get<ApiResponse<Category>>(`/categories/${id}`)
  },

  create(data: CreateCategoryDto) {
    return http.post<ApiResponse<Category>>('/categories', data)
  },

  update(id: string, data: UpdateCategoryDto) {
    return http.put<ApiResponse<Category>>(`/categories/${id}`, data)
  },

  delete(id: string) {
    return http.delete<ApiResponse<null>>(`/categories/${id}`)
  },

  togglePublic(id: string) {
    return http.patch<ApiResponse<Category>>(`/categories/${id}/toggle-public`)
  },
}
