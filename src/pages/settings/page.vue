<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { backupApi, type BackupInfo, type BackupJob } from '@/api/backup'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import { Database, FolderArchive, Download, Trash2, Loader2, HardDrive, RefreshCw, CheckCircle, XCircle } from 'lucide-vue-next'

const backups = ref<BackupInfo[]>([])
const jobs = ref<BackupJob[]>([])
const loading = ref(false)
const creatingDb = ref(false)
const creatingFiles = ref(false)

const deleteOpen = ref(false)
const deletingName = ref('')
const deleteLoading = ref(false)

let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchBackups()
  fetchJobs()
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(async () => {
    await fetchJobs()
    const hasRunning = jobs.value.some(j => j.status === 'running')
    if (!hasRunning) {
      if (pollInterval) clearInterval(pollInterval)
      pollInterval = null
      await fetchBackups()
    }
  }, 2000)
}

async function fetchBackups() {
  loading.value = true
  try {
    const { data } = await backupApi.listBackups()
    backups.value = data.data
  } catch {
    backups.value = []
  } finally {
    loading.value = false
  }
}

async function fetchJobs() {
  try {
    const { data } = await backupApi.getJobs()
    jobs.value = data.data
  } catch {
    jobs.value = []
  }
}

async function createDbDump() {
  creatingDb.value = true
  try {
    await backupApi.createDatabaseDump()
    await fetchJobs()
    startPolling()
  } catch {
    // ignore
  } finally {
    creatingDb.value = false
  }
}

async function createFilesDump() {
  creatingFiles.value = true
  try {
    await backupApi.createFilesDump()
    await fetchJobs()
    startPolling()
  } catch {
    // ignore
  } finally {
    creatingFiles.value = false
  }
}

async function downloadBackup(fileName: string) {
  try {
    await backupApi.downloadBackup(fileName)
  } catch {
    // ignore
  }
}

function openDelete(fileName: string) {
  deletingName.value = fileName
  deleteOpen.value = true
}

async function handleDelete() {
  if (!deletingName.value) return
  deleteLoading.value = true
  try {
    await backupApi.deleteBackup(deletingName.value)
    deleteOpen.value = false
    await fetchBackups()
  } catch {
    // ignore
  } finally {
    deleteLoading.value = false
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Sozlamalar</h1>

    <!-- Backup Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <HardDrive class="size-5" />
            Zaxira nusxalar (Backup)
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            Ma'lumotlar bazasi va fayllardan zaxira nusxa oling
          </p>
        </div>
        <Button variant="ghost" size="icon" @click="fetchBackups(); fetchJobs()" :disabled="loading">
          <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
        </Button>
      </div>

      <!-- Create buttons -->
      <div class="grid grid-cols-2 gap-4">
        <div class="border rounded-lg p-4 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Database class="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div class="font-medium">Ma'lumotlar bazasi</div>
              <div class="text-xs text-muted-foreground">PostgreSQL dump (.sql)</div>
            </div>
          </div>
          <Button @click="createDbDump" :disabled="creatingDb || jobs.some(j => j.type === 'database' && j.status === 'running')" class="w-full gap-2" variant="outline">
            <Loader2 v-if="creatingDb || jobs.some(j => j.type === 'database' && j.status === 'running')" class="size-4 animate-spin" />
            <Database v-else class="size-4" />
            {{ jobs.some(j => j.type === 'database' && j.status === 'running') ? 'Jarayonda...' : 'Dump olish' }}
          </Button>
        </div>

        <div class="border rounded-lg p-4 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FolderArchive class="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div class="font-medium">Fayllar</div>
              <div class="text-xs text-muted-foreground">Uploads papkasi (.tar.gz)</div>
            </div>
          </div>
          <Button @click="createFilesDump" :disabled="creatingFiles || jobs.some(j => j.type === 'files' && j.status === 'running')" class="w-full gap-2" variant="outline">
            <Loader2 v-if="creatingFiles || jobs.some(j => j.type === 'files' && j.status === 'running')" class="size-4 animate-spin" />
            <FolderArchive v-else class="size-4" />
            {{ jobs.some(j => j.type === 'files' && j.status === 'running') ? 'Jarayonda...' : 'Fayllarni arxivlash' }}
          </Button>
        </div>
      </div>

      <!-- Active jobs -->
      <div v-if="jobs.some(j => j.status === 'running')" class="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <Loader2 class="size-4 animate-spin" />
          <span class="font-medium">Zaxira nusxa yaratilmoqda...</span>
        </div>
      </div>

      <!-- Recent jobs -->
      <div v-if="jobs.filter(j => j.status !== 'running').length > 0" class="space-y-1.5">
        <div
          v-for="job in jobs.filter(j => j.status !== 'running').slice(0, 3)"
          :key="job.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          :class="job.status === 'done' ? 'bg-green-50 dark:bg-green-950/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/10 text-red-700 dark:text-red-400'"
        >
          <CheckCircle v-if="job.status === 'done'" class="size-4" />
          <XCircle v-else class="size-4" />
          <span>{{ job.type === 'database' ? 'Baza' : 'Fayllar' }}: {{ job.status === 'done' ? job.fileName : job.error }}</span>
        </div>
      </div>

      <!-- Backups list -->
      <div class="border rounded-lg">
        <div class="px-4 py-3 border-b bg-muted/30">
          <h3 class="text-sm font-medium">Mavjud zaxira nusxalar</h3>
        </div>
        <div class="divide-y max-h-[400px] overflow-y-auto">
          <div v-if="loading" class="p-8 text-center text-muted-foreground">
            <Loader2 class="size-5 animate-spin mx-auto mb-2" />
            Yuklanmoqda...
          </div>
          <div v-else-if="backups.length === 0" class="p-8 text-center text-muted-foreground text-sm">
            Zaxira nusxalar yo'q
          </div>
          <div
            v-else
            v-for="backup in backups"
            :key="backup.name"
            class="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="backup.type === 'database' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'">
              <Database v-if="backup.type === 'database'" class="size-4 text-blue-600 dark:text-blue-400" />
              <FolderArchive v-else class="size-4 text-green-600 dark:text-green-400" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ backup.name }}</div>
              <div class="text-xs text-muted-foreground">{{ formatDate(backup.date) }}</div>
            </div>
            <Badge variant="secondary" class="text-xs">{{ formatSize(backup.size) }}</Badge>
            <Button variant="ghost" size="icon" class="size-8" @click="downloadBackup(backup.name)" title="Yuklab olish">
              <Download class="size-4" />
            </Button>
            <Button variant="ghost" size="icon" class="size-8" @click="openDelete(backup.name)" title="O'chirish">
              <Trash2 class="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <DeleteDialog
      v-model:open="deleteOpen"
      :loading="deleteLoading"
      :description="`'${deletingName}' faylini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`"
      @confirm="handleDelete"
    />
  </div>
</template>
