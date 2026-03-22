import http from './http'
import type { ApiResponse, PaginatedData, PaginationParams, TranslatedField } from './types'

export interface Collection {
  id: string
  categoryId: string
  name: TranslatedField
  public: boolean
  isNew: boolean
  wordCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateCollectionDto {
  categoryId: string
  name: TranslatedField
  public?: boolean
}

export interface UpdateCollectionDto {
  categoryId?: string
  name?: TranslatedField
  public?: boolean
}

export interface CollectionParams extends PaginationParams {
  categoryId?: string
  public?: boolean
}

export const collectionApi = {
  getAll(params?: CollectionParams) {
    return http.get<ApiResponse<PaginatedData<Collection>>>('/collections', { params })
  },

  getById(id: string) {
    return http.get<ApiResponse<Collection>>(`/collections/${id}`)
  },

  create(data: CreateCollectionDto) {
    return http.post<ApiResponse<Collection>>('/collections', data)
  },

  update(id: string, data: UpdateCollectionDto) {
    return http.put<ApiResponse<Collection>>(`/collections/${id}`, data)
  },

  delete(id: string) {
    return http.delete<ApiResponse<null>>(`/collections/${id}`)
  },

  togglePublic(id: string) {
    return http.patch<ApiResponse<Collection>>(`/collections/${id}/toggle-public`)
  },

  toggleNew(id: string) {
    return http.patch<ApiResponse<Collection>>(`/collections/${id}/toggle-new`)
  },
}
