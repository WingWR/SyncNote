<template>
    <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">文档API测试</h2>

        <div class="space-y-4">
            <!-- 测试按钮 -->
            <div class="flex space-x-2">
                <button @click="testGetDocuments" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    获取文档列表
                </button>

                <button @click="testCreateDocument"
                    class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    创建测试文档
                </button>
            </div>

            <!-- 结果显示 -->
            <div class="bg-gray-100 p-4 rounded">
                <h3 class="font-medium mb-2">API响应:</h3>
                <pre class="text-sm overflow-auto">{{ JSON.stringify(apiResult, null, 2) }}</pre>
            </div>

            <!-- 错误显示 -->
            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>错误:</strong> {{ error }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getDocuments, createDocument } from '../../api/document'

const apiResult = ref<any>(null)
const error = ref<string>('')

const testGetDocuments = async () => {
    try {
        error.value = ''
        console.log('正在调用 getDocuments API...')
        const response = await getDocuments()
        console.log('API响应:', response)
        apiResult.value = response
    } catch (err: any) {
        console.error('API错误:', err)
        error.value = err.message || '获取文档列表失败'
        apiResult.value = null
    }
}

const testCreateDocument = async () => {
    try {
        error.value = ''
        console.log('正在调用 createDocument API...')
        const response = await createDocument({
            fileName: '测试文档.md',
            fileType: 'md'
        })
        console.log('API响应:', response)
        apiResult.value = response
    } catch (err: any) {
        console.error('API错误:', err)
        error.value = err.message || '创建文档失败'
        apiResult.value = null
    }
}
</script>