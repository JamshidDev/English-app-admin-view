export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  pageCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedData<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
}

export interface TranslatedField {
  uz: string
  ru: string
}
