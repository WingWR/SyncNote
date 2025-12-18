<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeDialog">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">添加协作者</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
          <input v-model.number="userId" type="number" placeholder="请输入用户ID"
            class="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">权限</label>
          <select v-model="permission" class="w-full px-3 py-2 border rounded-lg">
            <option value="read">只读</option>
            <option value="write">可编辑</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 justify-end mt-4">
        <button @click="closeDialog" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
        <button @click="addCollaboratorHandler"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">添加</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { addCollaborator, getCollaborators } from '../../../api/document'
import { useDocumentStore } from '../../../stores/document'

const props = defineProps({ visible: Boolean, docId: String })
const emit = defineEmits(['update:visible'])

const documentStore = useDocumentStore()
const userId = ref<number | null>(null)
const permission = ref<'READ' | 'WRITE'>('READ')

function closeDialog() {
  emit('update:visible', false)
  userId.value = null
  permission.value = 'READ'
}

async function addCollaboratorHandler() {
  if (!userId.value || !props.docId) return
  try {
    await addCollaborator(props.docId, { userId: userId.value.toString(), permission: permission.value })
    const response = await getCollaborators(props.docId)
    if (response.code === 200) {
      documentStore.setCollaborators(response.data)
    }
    closeDialog()
  } catch (error) {
    console.error(error)
    alert('添加协作者失败')
  }
}
</script>
