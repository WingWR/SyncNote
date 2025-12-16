// composables/useWorkspace.ts
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/document'

export function useWorkspace() {
  const route = useRoute()
  const router = useRouter()
  const documentStore = useDocumentStore()

  const currentDocId = computed(() => {
    const docId = route.params.id
    return docId ? parseInt(docId as string) : null
  })

  function openDocument(docId: number) {
    router.push(`/home/document/${docId}`)
  }

  function getFileTypeIcon(type: string) {
    const icons: Record<string, string> = {
      txt: '.txt',
      md: '.md',
      docx: '.docx',
      pptx: '.pptx'
    }
    return icons[type] || ''
  }

  return {
    documentStore,
    currentDocId,
    openDocument,
    getFileTypeIcon
  }
}
