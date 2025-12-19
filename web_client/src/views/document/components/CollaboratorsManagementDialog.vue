<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('update:visible', false)">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900">协作者管理</h3>
          <p class="text-sm text-gray-500 mt-1">管理文档的协作者和权限</p>
        </div>
        <button @click="$emit('update:visible', false)"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors">
          <XIcon :size="20" />
        </button>
      </div>

      <!-- 协作者列表 -->
      <div class="flex-1 overflow-y-auto">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p class="text-sm text-gray-500">加载协作者列表...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="collaborators.length === 0" class="flex flex-col items-center justify-center py-12">
          <UsersIcon :size="48" class="text-gray-300 mb-3" />
          <p class="text-sm text-gray-500 mb-1">还没有协作者</p>
          <p class="text-xs text-gray-400">点击下方按钮添加协作者</p>
        </div>

        <!-- 协作者卡片列表 -->
        <div v-else class="space-y-2">
          <div v-for="collaborator in collaborators" :key="collaborator.id"
            class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <!-- 协作者信息 -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <div
                  class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {{ getUserInitial(collaborator.userId) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    用户 ID: {{ collaborator.userId }}
                    <span v-if="collaborator.userId === currentUserId"
                      class="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      我
                    </span>
                    <span v-if="collaborator.userId === documentOwnerId"
                      class="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      拥有者
                    </span>
                  </p>
                  <p class="text-xs text-gray-500">
                    加入时间: {{ formatDate(collaborator.joinedAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 权限显示和操作 -->
            <div class="flex items-center gap-2">
              <!-- 权限标签 -->
              <span :class="[
                'px-3 py-1 text-xs font-medium rounded-full',
                collaborator.permission === 'WRITE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              ]">
                <component :is="collaborator.permission === 'WRITE' ? EditIcon : EyeIcon" :size="12"
                  class="inline mr-1" />
                {{ collaborator.permission === 'WRITE' ? '可编辑' : '只读' }}
              </span>

              <!-- 操作按钮 -->
              <div v-if="canManage && collaborator.userId !== currentUserId" class="flex gap-1">
                <!-- 切换权限按钮 -->
                <button @click="handleTogglePermission(collaborator)"
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  :title="collaborator.permission === 'WRITE' ? '降级为只读' : '升级为可编辑'">
                  <RefreshCwIcon :size="16" />
                </button>

                <!-- 移除按钮 -->
                <button @click="handleRemove(collaborator)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="移除协作者">
                  <Trash2Icon :size="16" />
                </button>
              </div>

              <!-- 当前用户自己不能操作 -->
              <div v-else-if="collaborator.userId === currentUserId" class="text-xs text-gray-400 px-2">
                (自己)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between">
        <button @click="$emit('add-collaborator')"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon :size="16" class="inline mr-1" />
          添加协作者
        </button>
        <button @click="$emit('update:visible', false)"
          class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { XIcon, EyeIcon, EditIcon, RefreshCwIcon, Trash2Icon, PlusIcon, UsersIcon } from 'lucide-vue-next'
import { getCollaborators, updateCollaboratorPermission, removeCollaborator } from '../../../api/document'
import type { DocumentCollaborator } from '../../../stores/document/types'
import { useUserStore } from '../../../stores/user'

interface Props {
  visible: boolean
  documentId: string | null
  documentOwnerId?: string
  currentUserPermission?: 'READ' | 'WRITE'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'add-collaborator': []
  'refresh': []
}>()

const userStore = useUserStore()
const currentUserId = computed(() => userStore.currentUser?.id)

const loading = ref(false)
const collaborators = ref<DocumentCollaborator[]>([])

// 是否有管理权限（拥有者或WRITE权限）
const canManage = computed(() => {
  return props.currentUserPermission === 'WRITE' ||
    props.documentOwnerId === currentUserId.value
})

// 加载协作者列表
async function loadCollaborators() {
  if (!props.documentId) return

  loading.value = true
  try {
    const response = await getCollaborators(props.documentId)
    if (response.code === 200) {
      collaborators.value = response.data
    } else {
      alert(response.message || '加载协作者列表失败')
    }
  } catch (error) {
    console.error('加载协作者列表失败:', error)
    alert('加载协作者列表失败')
  } finally {
    loading.value = false
  }
}

// 切换权限
async function handleTogglePermission(collaborator: DocumentCollaborator) {
  if (!props.documentId) return

  const newPermission = collaborator.permission === 'WRITE' ? 'READ' : 'WRITE'
  const confirmMessage = newPermission === 'WRITE'
    ? '确定要将此协作者升级为可编辑权限吗？'
    : '确定要将此协作者降级为只读权限吗？'

  if (!confirm(confirmMessage)) return

  try {
    const response = await updateCollaboratorPermission(
      props.documentId,
      collaborator.userId,
      { permission: newPermission }
    )
    if (response.code === 200) {
      // 更新本地数据
      const index = collaborators.value.findIndex(c => c.id === collaborator.id)
      if (index !== -1 && collaborators.value[index]) {
        collaborators.value[index]!.permission = newPermission
      }
      emit('refresh')
    } else {
      alert(response.message || '更新权限失败')
    }
  } catch (error) {
    console.error('更新权限失败:', error)
    alert('更新权限失败')
  }
}

// 移除协作者
async function handleRemove(collaborator: DocumentCollaborator) {
  if (!props.documentId) return
  if (!confirm(`确定要移除用户 ${collaborator.userId} 吗？`)) return

  try {
    const response = await removeCollaborator(props.documentId, collaborator.userId)
    if (response.code === 200) {
      // 从列表中移除
      collaborators.value = collaborators.value.filter(c => c.id !== collaborator.id)
      emit('refresh')
    } else {
      alert(response.message || '移除协作者失败')
    }
  } catch (error) {
    console.error('移除协作者失败:', error)
    alert('移除协作者失败')
  }
}

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取用户首字母（用于头像）
function getUserInitial(userId: string) {
  return userId.toString().slice(-1)
}

// 监听对话框打开，自动加载数据
watch(() => props.visible, (newValue) => {
  if (newValue) {
    loadCollaborators()
  }
})
</script>
