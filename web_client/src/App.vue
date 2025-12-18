<template>
    <div id="app">
        <router-view></router-view>

        <!-- 全局用户编辑对话框 -->
        <GlobalUserEditDialog />
    </div>
</template>

<script setup lang="ts">
import GlobalUserEditDialog from './components/global/GlobalUserEditDialog.vue'
</script>