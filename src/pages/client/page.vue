<script setup lang="ts">
import { ref, watch } from 'vue'
import { clientApi, type Client, type CreateClientDto } from '@/api/client'
import type { PaginationMeta } from '@/api/types'
import PageHeader from '@/components/shared/PageHeader.vue'
import CursorPagination from '@/components/shared/CursorPagination.vue'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import DataTable from './ui/DataTable.vue'
import ClientForm from './ui/ClientForm.vue'

const search = ref('')
const pageSize = ref('10')
const currentPage = ref(1)
const loading = ref(false)
const clients = ref<Client[]>([])
const meta = ref<PaginationMeta>({ page: 1, pageSize: 20, total: 0, pageCount: 0, hasNextPage: false, hasPreviousPage: false })

const formOpen = ref(false)
const editingClient = ref<Client | null>(null)
const formLoading = ref(false)

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleteLoading = ref(false)

async function fetchClients() {
  loading.value = true
  try {
    const { data } = await clientApi.getAll({
      page: currentPage.value,
      pageSize: Number(pageSize.value),
      search: search.value || undefined,
    })
    clients.value = data.data.data
    meta.value = data.data.meta
  } catch {
    clients.value = []
  } finally {
    loading.value = false
  }
}

watch([pageSize], () => { currentPage.value = 1; fetchClients() })
watch(search, () => { currentPage.value = 1; fetchClients() })
fetchClients()

function goToPage(page: number) {
  currentPage.value = page
  fetchClients()
}

function openCreate() { editingClient.value = null; formOpen.value = true }
function openEdit(client: Client) { editingClient.value = client; formOpen.value = true }

async function handleSubmit(formData: CreateClientDto) {
  formLoading.value = true
  try {
    if (editingClient.value) {
      const { telegramId, ...updateData } = formData
      await clientApi.update(editingClient.value.id, updateData)
    } else {
      await clientApi.create(formData)
    }
    formOpen.value = false
    fetchClients()
  } finally {
    formLoading.value = false
  }
}

function openDelete(id: string) { deletingId.value = id; deleteOpen.value = true }

async function handleDelete() {
  if (!deletingId.value) return
  deleteLoading.value = true
  try {
    await clientApi.delete(deletingId.value)
    deleteOpen.value = false
    fetchClients()
  } finally {
    deleteLoading.value = false
  }
}

async function handleToggleBlock(id: string) {
  try {
    await clientApi.toggleBlock(id)
    fetchClients()
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="space-y-4">
    <PageHeader title="Mijozlar" create-label="Yangi mijoz" v-model:search="search" @create="openCreate" />
    <DataTable :data="clients" :loading="loading" @edit="openEdit" @delete="openDelete" @toggle-block="handleToggleBlock" />
    <CursorPagination :meta="meta" :loading="loading" v-model:page-size="pageSize" @change="goToPage" />
    <ClientForm :open="formOpen" :client="editingClient" :loading="formLoading" @update:open="formOpen = $event" @submit="handleSubmit" />
    <DeleteDialog v-model:open="deleteOpen" :loading="deleteLoading" @confirm="handleDelete" />
  </div>
</template>
