<template>
  <div class="p-4 overflow-y-auto">
    <div v-if="userStore.currentUser" class="mb-4">
      <div class="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
        <img
          :src="userStore.currentUser.avatar"
          :alt="userStore.currentUser.username"
          class="w-10 h-10 rounded-full"
        />
        <div class="flex-1">
          <div class="font-medium text-gray-900">{{ userStore.currentUser.username }}</div>
          <div class="text-sm text-gray-500">{{ userStore.currentUser.email }}</div>
        </div>
      </div>
      <button
        @click="openEditDialog"
        class="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        修改用户信息
      </button>
    </div>

    <button
      @click="handleLogout"
      class="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      退出登录
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSystemSettings } from '../../composables/settings/useSystemSettings'

const {
  userStore,
  handleLogout
} = useSystemSettings()


function openEditDialog() {
  // 调用全局函数打开编辑对话框
  if ((window as any).openUserEditDialog) {
    (window as any).openUserEditDialog()
  }
}
</script>
