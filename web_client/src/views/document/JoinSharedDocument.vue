<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <div v-if="loading" class="text-center">
        <div
          class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4">
        </div>
        <p class="text-gray-600">正在加入文档...</p>
      </div>

      <div v-else-if="error" class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">加入失败</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <div class="flex gap-2 justify-center">
          <button @click="retry"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            重试
          </button>
          <button @click="goHome"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            返回首页
          </button>
        </div>
      </div>

      <div v-else class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">加入成功</h3>
        <p class="text-gray-600">正在跳转到文档...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { joinSharedDocument } from '../../api/document'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')

async function joinDocument() {
  const documentId = route.params.id as string

  if (!documentId) {
    error.value = '无效的文档ID'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''

    const response = await joinSharedDocument(documentId)

    if (response.code === 200) {
      // 加入成功，跳转到文档编辑页面
      setTimeout(() => {
        router.push(`/home/document/${documentId}`)
      }, 1000)
    } else {
      error.value = response.message || '加入文档失败，请稍后重试'
      loading.value = false
    }
  } catch (err: any) {
    console.error('加入文档失败:', err)

    // 解析错误信息
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = '加入文档失败，请稍后重试'
    }

    loading.value = false
  }
}

function retry() {
  joinDocument()
}

function goHome() {
  router.push('/home')
}

onMounted(() => {
  joinDocument()
})
</script>
