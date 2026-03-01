<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { navigation, type NavItem } from '@/config/navigation'

const route = useRoute()
const openMenus = ref<Set<string>>(new Set())

// Avtomatik submenu ochish — aktiv child bo'lsa
watchEffect(() => {
  for (const item of navigation) {
    if (item.children?.some((c) => route.path === c.path)) {
      openMenus.value.add(item.title)
    }
  }
})

function toggleMenu(title: string) {
  if (openMenus.value.has(title)) {
    openMenus.value.delete(title)
  } else {
    openMenus.value.add(title)
  }
}

function isActive(item: NavItem): boolean {
  if (item.path) return route.path === item.path
  return item.children?.some((c) => route.path === c.path) ?? false
}

function isChildActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <Sidebar>
    <SidebarHeader class="border-b px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          E
        </div>
        <span class="text-lg font-semibold">EasyEnglish</span>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navigation" :key="item.title">
              <!-- Item without children -->
              <SidebarMenuButton
                v-if="!item.children"
                as-child
                :is-active="isActive(item)"
              >
                <RouterLink :to="item.path!">
                  <component :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>

              <!-- Item with children (submenu) -->
              <template v-else>
                <SidebarMenuButton
                  :is-active="isActive(item)"
                  @click="toggleMenu(item.title)"
                >
                  <component :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                  <ChevronDown
                    class="ml-auto size-4 transition-transform"
                    :class="{ 'rotate-180': openMenus.has(item.title) }"
                  />
                </SidebarMenuButton>

                <SidebarMenuSub v-show="openMenus.has(item.title)">
                  <SidebarMenuSubItem v-for="child in item.children" :key="child.path">
                    <SidebarMenuSubButton
                      as-child
                      :is-active="isChildActive(child.path)"
                    >
                      <RouterLink :to="child.path">
                        {{ child.title }}
                      </RouterLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </template>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
