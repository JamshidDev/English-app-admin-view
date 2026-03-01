import http from './http'
import type { ApiResponse, PaginatedData, PaginationParams, TranslatedField } from './types'

export interface Word {
  id: string
  collectionId: string
  word: string
  wordTranslate: TranslatedField
  transcription: string | null
  example: string | null
  exampleTranslate: TranslatedField | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateWordDto {
  collectionId: string
  word: string
  wordTranslate: TranslatedField
  transcription?: string
  example?: string
  exampleTranslate?: TranslatedField
}

export interface UpdateWordDto {
  word?: string
  wordTranslate?: TranslatedField
  transcription?: string
  example?: string
  exampleTranslate?: TranslatedField
}

export interface WordParams extends PaginationParams {
  collectionId?: string
}

export const wordApi = {
  getAll(params?: WordParams) {
    return http.get<ApiResponse<PaginatedData<Word>>>('/words', { params })
  },

  getById(id: string) {
    return http.get<ApiResponse<Word>>(`/words/${id}`)
  },

  create(data: CreateWordDto) {
    return http.post<ApiResponse<Word>>('/words', data)
  },

  update(id: string, data: UpdateWordDto) {
    return http.put<ApiResponse<Word>>(`/words/${id}`, data)
  },

  delete(id: string) {
    return http.delete<ApiResponse<null>>(`/words/${id}`)
  },
}
