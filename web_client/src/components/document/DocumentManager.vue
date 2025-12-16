<template>
  <div class="p-4 border-b border-gray-200">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">文档管理</h3>

    <div class="space-y-2">
      <DocumentJoinButton @click="showJoinDialog = true" />
      <DocumentCreateButton @click="showCreateDialog = true" />
      <DocumentUploadButton @click="triggerUpload" />
      <input type="file" ref="fileInputRef" class="hidden" @change="handleUpload" />
    </div>

    <DocumentJoinDialog
      v-model:visible="showJoinDialog"
      v-model:documentId="documentIdInput"
      @join="joinDocument"
    />
    <DocumentCreateDialog
      v-model:visible="showCreateDialog"
      v-model:name="newDocumentName"
      v-model:type="newDocumentType"
      @create="createDocument"
    />
  </div>
</template>

<script setup lang="ts">
import DocumentJoinButton from './controls/DocumentJoinButton.vue'
import DocumentCreateButton from './controls/DocumentCreateButton.vue'
import DocumentUploadButton from './controls/DocumentUploadButton.vue'
import DocumentJoinDialog from './dialogs/DocumentJoinDialog.vue'
import DocumentCreateDialog from './dialogs/DocumentCreateDialog.vue'
import { useDocumentManager } from '../../composables/document/useDocumentManager'

const {
  showJoinDialog,
  showCreateDialog,
  documentIdInput,
  newDocumentName,
  newDocumentType,
  fileInputRef,
  triggerUpload,
  handleUpload,
  joinDocument,
  createDocument
} = useDocumentManager()
</script>
