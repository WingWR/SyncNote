<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
    <WelcomeSection>
      <FeatureCards />

      <!-- 👇 slot 必须放这里 -->
    </WelcomeSection>

    <!-- API测试面板 -->
    <div v-if="isDev && showApiTest"
      class="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <DocumentListTest />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WelcomeSection from './WelcomeSection.vue'
import FeatureCards from './FeatureCards.vue'
</script>
