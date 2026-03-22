import http from './http'
import type { ApiResponse } from './types'

export interface BackupInfo {
  name: string
  size: number
  date: string
  type: 'database' | 'files'
}

export interface BackupJob {
  id: string
  type: 'database' | 'files'
  status: 'pending' | 'running' | 'done' | 'error'
  fileName?: string
  error?: string
  startedAt: string
  finishedAt?: string
}

export const backupApi = {
  createDatabaseDump() {
    return http.post<ApiResponse<BackupJob>>('/backup/database')
  },

  createFilesDump() {
    return http.post<ApiResponse<BackupJob>>('/backup/files')
  },

  getJobs() {
    return http.get<ApiResponse<BackupJob[]>>('/backup/jobs')
  },

  listBackups() {
    return http.get<ApiResponse<BackupInfo[]>>('/backup/list')
  },

  async downloadBackup(fileName: string) {
    const response = await http.get(`/backup/download/${fileName}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  deleteBackup(fileName: string) {
    return http.delete<ApiResponse<{ deleted: boolean }>>(`/backup/${fileName}`)
  },
}
