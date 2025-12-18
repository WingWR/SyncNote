<template>
  <div class="p-2 border-t border-gray-200 relative">
    <button
      @click="showSettings = !showSettings"
      class="w-full flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="系统设置"
    >
      <Settings :size="20" />
      <span class="text-xs">设置</span>
    </button>

    <!-- 设置抽屉 -->
    <Transition name="slide">
      <div
        v-if="showSettings"
        class="absolute left-16 bottom-0 w-80 bg-white border-r border-t border-gray-200 shadow-lg z-20"
        style="max-height: 50vh;"
      >
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">系统设置</h3>
          <button @click="showSettings = false" class="p-1 text-gray-500 hover:bg-gray-100 rounded">
            <X :size="20" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto" style="max-height: calc(50vh - 60px);">
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
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { Settings, X } from 'lucide-vue-next'
import { useSystemSettings } from '../../composables/settings/useSystemSettings'

const {
  showSettings,
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

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
