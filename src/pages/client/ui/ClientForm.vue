<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Client, CreateClientDto } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  client?: Client | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: CreateClientDto]
}>()

const form = ref({
  firstName: '',
  lastName: '',
  telegramId: '',
  phone: '',
})

watch(() => props.open, (val) => {
  if (val && props.client) {
    form.value = {
      firstName: props.client.firstName,
      lastName: props.client.lastName || '',
      telegramId: props.client.telegramId,
      phone: props.client.phone || '',
    }
  } else if (val) {
    form.value = {
      firstName: '',
      lastName: '',
      telegramId: '',
      phone: '',
    }
  }
})

function handleSubmit() {
  const data: CreateClientDto = {
    firstName: form.value.firstName,
    telegramId: form.value.telegramId,
  }
  if (form.value.lastName) data.lastName = form.value.lastName
  if (form.value.phone) data.phone = form.value.phone
  emit('submit', data)
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ client ? "Mijozni tahrirlash" : "Yangi mijoz" }}</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="firstName">Ism *</Label>
          <Input id="firstName" v-model="form.firstName" placeholder="Ali" required />
        </div>
        <div class="space-y-2">
          <Label for="lastName">Familiya</Label>
          <Input id="lastName" v-model="form.lastName" placeholder="Valiyev" />
        </div>
        <div class="space-y-2">
          <Label for="telegramId">Telegram ID *</Label>
          <Input id="telegramId" v-model="form.telegramId" placeholder="123456789" required />
        </div>
        <div class="space-y-2">
          <Label for="phone">Telefon</Label>
          <Input id="phone" v-model="form.phone" placeholder="+998901234567" />
        </div>
        <DialogFooter class="gap-2">
          <Button variant="outline" type="button" @click="$emit('update:open', false)">Bekor qilish</Button>
          <Button type="submit" :disabled="loading || !form.firstName || !form.telegramId">
            {{ loading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
