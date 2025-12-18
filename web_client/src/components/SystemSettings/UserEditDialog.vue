<template>
  <div
    v-if="showEditDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">修改用户信息</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="留空则不修改密码"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">头像</label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700"
          />
          <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF 等图片格式</p>
        </div>
      </div>
      <div class="flex gap-2 justify-end mt-4">
        <button
          @click="close"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          取消
        </button>
        <button
          @click="save"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const {} = defineProps<{
  showEditDialog: boolean
  form: { username: string; password: string; avatarFile: File | null }
  onSave: () => void
  onClose: () => void
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'close'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  // 这里可以通过emit通知父组件文件已选择
  // emit('file-selected', file)
}

function save() {
  emit('save')
}

function close() {
  emit('close')
}
</script>
