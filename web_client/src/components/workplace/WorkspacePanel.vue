<template>
  <div class="p-4 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">工作区</h3>
    <DocumentList
      :documentsWithPermission="documentStore.documentsWithPermission"
      :documentsWithoutPermission="documentStore.documentsWithoutPermission"
      :currentDocId="currentDocId"
      :openDocument="openDocument"
      :getFileTypeIcon="getFileTypeIcon"
    />
  </div>
</template>

<script setup lang="ts">
import DocumentList from './DocumentList.vue'
import { useWorkspace } from '../../composables/workspace/useWorkspace'

const { documentStore, currentDocId, openDocument, getFileTypeIcon } = useWorkspace()
</script>
