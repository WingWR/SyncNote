<template>
  <div
    v-if="showEditDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">头像URL</label>
          <input
            v-model="form.avatar"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
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

const props = defineProps<{
  showEditDialog: boolean
  form: { username: string; email: string; avatar: string }
  onSave: () => void
  onClose: () => void
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'close'): void
}>()

function save() {
  emit('save')
}

function close() {
  emit('close')
}
</script>
