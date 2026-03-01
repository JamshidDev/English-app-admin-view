<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { clientApi, type Client } from '@/api/client'
import { categoryApi, type Category } from '@/api/category'
import { clientCategoryApi, type ClientCategory } from '@/api/client-category'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from '@/components/ui/table'
import DeleteDialog from '@/components/shared/DeleteDialog.vue'
import { ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-vue-next'

const clients = ref<Client[]>([])
const allCategories = ref<Category[]>([])
const clientCategories = ref<ClientCategory[]>([])
const selectedClientId = ref<string>('')
const selectedCategoryId = ref<string>('')
const loading = ref(false)
const adding = ref(false)

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleteLoading = ref(false)

onMounted(async () => {
  try {
    const [clientRes, catRes] = await Promise.all([
      clientApi.getAll({ pageSize: 100 }),
      categoryApi.getAll({ pageSize: 100 }),
    ])
    clients.value = clientRes.data.data.data
    allCategories.value = catRes.data.data.data
  } catch { /* ignore */ }
})

watch(selectedClientId, async (id) => {
  if (!id) {
    clientCategories.value = []
    return
  }
  await fetchClientCategories()
})

async function fetchClientCategories() {
  if (!selectedClientId.value) return
  loading.value = true
  try {
    const { data } = await clientCategoryApi.getByClient(selectedClientId.value)
    clientCategories.value = data.data
  } catch {
    clientCategories.value = []
  } finally {
    loading.value = false
  }
}

const availableCategories = computed(() => {
  const assignedIds = new Set(clientCategories.value.map((cc) => cc.categoryId))
  return allCategories.value.filter((c) => !assignedIds.has(c.id))
})

function getCategoryName(categoryId: string): string {
  const cat = allCategories.value.find((c) => c.id === categoryId)
  return cat?.name.uz || '—'
}

function getClientLabel(client: Client): string {
  return `${client.firstName} ${client.lastName || ''}`.trim()
}

async function addCategory() {
  if (!selectedCategoryId.value || !selectedClientId.value) return
  adding.value = true
  try {
    await clientCategoryApi.create({
      clientId: selectedClientId.value,
      categoryId: selectedCategoryId.value,
      order: clientCategories.value.length,
    })
    await fetchClientCategories()
    selectedCategoryId.value = ''
  } finally {
    adding.value = false
  }
}

function openDelete(id: string) {
  deletingId.value = id
  deleteOpen.value = true
}

async function handleDelete() {
  if (!deletingId.value) return
  deleteLoading.value = true
  try {
    await clientCategoryApi.delete(deletingId.value)
    deleteOpen.value = false
    await fetchClientCategories()
  } finally {
    deleteLoading.value = false
  }
}

async function moveItem(index: number, direction: 'up' | 'down') {
  if (!selectedClientId.value) return
  const items = [...clientCategories.value]
  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= items.length) return
  const temp = items[index]!
  items[index] = items[swapIndex]!
  items[swapIndex] = temp
  clientCategories.value = items

  try {
    await clientCategoryApi.reorder(selectedClientId.value, {
      categoryIds: items.map((i) => i.categoryId),
    })
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Mijoz kategoriyalari</h1>
    </div>

    <!-- Mijoz tanlash -->
    <div class="flex items-end gap-3">
      <div class="w-72 space-y-1.5">
        <label class="text-sm font-medium">Mijozni tanlang</label>
        <Select v-model="selectedClientId">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Mijoz tanlang..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="client in clients" :key="client.id" :value="client.id">
              {{ getClientLabel(client) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Kategoriya qo'shish -->
      <template v-if="selectedClientId">
        <div class="flex-1 space-y-1.5">
          <label class="text-sm font-medium">Kategoriya qo'shish</label>
          <div class="flex gap-2">
            <Select v-model="selectedCategoryId" :disabled="!availableCategories.length">
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="availableCategories.length ? 'Kategoriya tanlang...' : 'Barcha kategoriyalar biriktirilgan'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name.uz }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button :disabled="!selectedCategoryId || adding" @click="addCategory" class="shrink-0">
              <Plus class="mr-2 size-4" />
              Qo'shish
            </Button>
          </div>
        </div>
      </template>
    </div>

    <!-- Jadval -->
    <div v-if="selectedClientId" class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-16">Tartib</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead class="w-24">Ko'chirish</TableHead>
            <TableHead class="w-24 text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow>
              <TableCell colspan="4" class="h-24 text-center text-muted-foreground">
                Yuklanmoqda...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="clientCategories.length">
            <TableRow v-for="(item, index) in clientCategories" :key="item.id">
              <TableCell>
                <Badge variant="outline">{{ index + 1 }}</Badge>
              </TableCell>
              <TableCell class="font-medium">
                {{ getCategoryName(item.categoryId) }}
              </TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-7"
                    :disabled="index === 0"
                    @click="moveItem(index, 'up')"
                  >
                    <ArrowUp class="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-7"
                    :disabled="index === clientCategories.length - 1"
                    @click="moveItem(index, 'down')"
                  >
                    <ArrowDown class="size-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" @click="openDelete(item.id)">
                  <Trash2 class="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          </template>
          <TableEmpty v-else :colspan="4">
            Hali kategoriya biriktirilmagan
          </TableEmpty>
        </TableBody>
      </Table>
    </div>

    <div v-else class="rounded-md border py-12 text-center text-muted-foreground">
      Kategoriyalarni ko'rish uchun avval mijozni tanlang
    </div>

    <DeleteDialog v-model:open="deleteOpen" :loading="deleteLoading" @confirm="handleDelete" />
  </div>
</template>
