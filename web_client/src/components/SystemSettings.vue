<template>
  <div class="p-2 border-t border-gray-200">
    <button
      @click="showSettings = !showSettings"
      class="w-full flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="系统设置"
    >
      <Settings :size="20" />
      <span class="text-xs">设置</span>
    </button>

    <!-- 设置面板（抽屉形式） -->
    <Transition name="slide">
      <div
        v-if="showSettings"
        class="absolute left-16 bottom-0 w-80 bg-white border-r border-t border-gray-200 shadow-lg z-20"
        style="max-height: 50vh;"
      >
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">系统设置</h3>
          <button
            @click="showSettings = false"
            class="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto" style="max-height: calc(50vh - 60px);">
          <!-- 当前用户信息 -->
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
              @click="showEditDialog = true"
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

    <!-- 编辑用户信息对话框 -->
    <div
      v-if="showEditDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showEditDialog = false"
    >
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">修改用户信息</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              v-model="editForm.username"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">头像URL</label>
            <input
              v-model="editForm.avatar"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button
            @click="showEditDialog = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            取消
          </button>
          <button
            @click="handleUpdateUser"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Settings, X } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { userApi } from '../api/user'

const userStore = useUserStore()
const router = useRouter()

const showSettings = ref(false)
const showEditDialog = ref(false)
const editForm = reactive({
  username: '',
  email: '',
  avatar: ''
})

watch(showEditDialog, (show) => {
  if (show && userStore.currentUser) {
    editForm.username = userStore.currentUser.username
    editForm.email = userStore.currentUser.email
    editForm.avatar = userStore.currentUser.avatar
  }
})

async function handleUpdateUser() {
  try {
    const updatedUser = await userApi.updateUser(editForm)
    userStore.setUser(updatedUser)
    showEditDialog.value = false
  } catch (error) {
    console.error('更新用户信息失败:', error)
    alert('更新用户信息失败')
  }
}

async function handleLogout() {
  try {
    await userApi.logout()
    userStore.logout()
    localStorage.removeItem('token')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    // 即使API调用失败，也清除本地状态
    userStore.logout()
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
/* 抽屉滑入动画 */
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
