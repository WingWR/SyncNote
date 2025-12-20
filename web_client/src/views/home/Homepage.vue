<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
    <WelcomeSection>
      <FeatureCards />
    </WelcomeSection>
  </div>
</template>

<script setup lang="ts">
import WelcomeSection from './WelcomeSection.vue'
import FeatureCards from './FeatureCards.vue'
</script>
