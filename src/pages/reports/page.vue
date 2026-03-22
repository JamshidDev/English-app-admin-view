<script setup lang="ts">
import { ref, watch } from 'vue'
import { reportsApi, type Report, type FixReportDto, type ReportStats } from '@/api/reports'
import type { PaginationMeta } from '@/api/types'
import CursorPagination from '@/components/shared/CursorPagination.vue'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DataTable from './ui/DataTable.vue'
import FixForm from './ui/FixForm.vue'

const pageSize = ref('10')
const currentPage = ref(1)
const statusFilter = ref<string>('pending')
const loading = ref(false)
const reports = ref<Report[]>([])
const meta = ref<PaginationMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 0, hasNextPage: false, hasPreviousPage: false })
const stats = ref<ReportStats>({ pending: 0, fixed: 0, skipped: 0 })

const modalOpen = ref(false)
const selectedReport = ref<Report | null>(null)
const actionLoading = ref(false)

async function fetchReports() {
  loading.value = true
  try {
    const { data } = await reportsApi.getAll({
      page: currentPage.value,
      pageSize: Number(pageSize.value),
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    })
    reports.value = data.data.data
    meta.value = data.data.meta
  } catch {
    reports.value = []
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const { data } = await reportsApi.getStats()
    stats.value = data.data
  } catch { /* ignore */ }
}

watch([pageSize, statusFilter], () => { currentPage.value = 1; fetchReports() })
fetchReports()
fetchStats()

function goToPage(page: number) {
  currentPage.value = page
  fetchReports()
}

function openReport(report: Report) {
  selectedReport.value = report
  modalOpen.value = true
}

async function handleFix(data: FixReportDto) {
  if (!selectedReport.value) return
  actionLoading.value = true
  try {
    await reportsApi.fix(selectedReport.value.id, data)
    modalOpen.value = false
    fetchReports()
    fetchStats()
  } finally {
    actionLoading.value = false
  }
}

async function handleSkip() {
  if (!selectedReport.value) return
  actionLoading.value = true
  try {
    await reportsApi.skip(selectedReport.value.id)
    modalOpen.value = false
    fetchReports()
    fetchStats()
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Xatolik xabarlari</h1>
        <Badge v-if="stats.pending > 0" variant="destructive">{{ stats.pending }} ta yangi</Badge>
      </div>
      <div class="flex items-center gap-3 text-sm text-muted-foreground">
        <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-yellow-400"></span> {{ stats.pending }} kutilmoqda</span>
        <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-green-500"></span> {{ stats.fixed }} tuzatildi</span>
        <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-gray-400"></span> {{ stats.skipped }} o'tkazildi</span>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <Select v-model="statusFilter">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Holat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barchasi</SelectItem>
          <SelectItem value="pending">Kutilmoqda</SelectItem>
          <SelectItem value="fixed">Tuzatildi</SelectItem>
          <SelectItem value="skipped">O'tkazildi</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <DataTable :data="reports" :loading="loading" :page="currentPage" :page-size="Number(pageSize)" @open="openReport" />
    <CursorPagination :meta="meta" :loading="loading" v-model:page-size="pageSize" @change="goToPage" />

    <FixForm
      :open="modalOpen"
      :report="selectedReport"
      :loading="actionLoading"
      @update:open="modalOpen = $event"
      @fix="handleFix"
      @skip="handleSkip"
    />
  </div>
</template>
