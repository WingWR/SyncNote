<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
    <WelcomeSection>
      <FeatureCards />

      <!-- 👇 slot 必须放这里 -->
      <template #dev-link>
        <div v-if="isDev" class="mt-6">
          <a
            href="/home/editor-test"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🧪 测试编辑器样式（无需后端）
          </a>
        </div>
      </template>
    </WelcomeSection>
  </div>
</template>

<script setup lang="ts">
import WelcomeSection from './WelcomeSection.vue'
import FeatureCards from './FeatureCards.vue'

const isDev = import.meta.env.DEV
</script>
