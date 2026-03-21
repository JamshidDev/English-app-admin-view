import http from './http'
import type { ApiResponse, PaginatedData, PaginationParams, TranslatedField } from './types'

export interface WordSnapshot {
  word: string
  wordTranslate: TranslatedField
  transcription: string | null
  example: string | null
  exampleTranslate: TranslatedField | null
}

export interface Report {
  id: string
  page: string
  message: string
  wordSnapshot: WordSnapshot
  status: string
  createdAt: string
  wordId: string
  collectionId: string
  clientName: string
  clientTelegramId: string
  wordCurrent: string
  collectionName: TranslatedField
}

export interface ReportDetail extends Report {
  clientId: string
  wordTranslateCurrent: TranslatedField
  transcriptionCurrent: string | null
  exampleCurrent: string | null
  exampleTranslateCurrent: TranslatedField | null
}

export interface FixReportDto {
  word?: string
  wordTranslate?: TranslatedField
  transcription?: string
  example?: string
  exampleTranslate?: TranslatedField
}

export interface ReportParams extends PaginationParams {
  status?: string
}

export interface ReportStats {
  pending: number
  fixed: number
  skipped: number
}

export const reportsApi = {
  getAll(params?: ReportParams) {
    return http.get<ApiResponse<PaginatedData<Report>>>('/reports', { params })
  },

  getById(id: string) {
    return http.get<ApiResponse<ReportDetail>>(`/reports/${id}`)
  },

  fix(id: string, data: FixReportDto) {
    return http.patch<ApiResponse<{ message: string }>>(`/reports/${id}/fix`, data)
  },

  skip(id: string) {
    return http.patch<ApiResponse<{ message: string }>>(`/reports/${id}/skip`)
  },

  getStats() {
    return http.get<ApiResponse<ReportStats>>('/reports/stats')
  },
}
