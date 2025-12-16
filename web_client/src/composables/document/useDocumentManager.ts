import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '../../stores/document'
import { createDocument, joinSharedDocument, uploadDocument } from '../../api/document'

export function useDocumentManager() {
  const documentStore = useDocumentStore()
  const router = useRouter()

  // 弹窗状态
  const showJoinDialog = ref(false)
  const showCreateDialog = ref(false)

  // 输入状态
  const documentIdInput = ref('')
  const newDocumentName = ref('')
  const newDocumentType = ref<'txt' | 'md' | 'docx' | 'pptx'>('txt')

  // 上传文件
  const fileInputRef = ref<HTMLInputElement | null>(null)

  function triggerUpload() {
    fileInputRef.value?.click()
  }

  async function handleUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    try {
      const document = await uploadDocument(file)
      documentStore.addDocument(document)
      router.push(`/home/document/${document.id}`)
    } catch (err) {
      console.error(err)
      alert('上传失败')
    }
  }

  async function joinDocument() {
    if (!documentIdInput.value) return
    try {
      const docId = parseInt(documentIdInput.value)
      const document = await joinSharedDocument(docId)
      documentStore.addDocument(document)
      showJoinDialog.value = false
      documentIdInput.value = ''
      router.push(`/home/document/${document.id}`)
    } catch (err) {
      console.error(err)
      alert('加入文档失败，请检查文档ID')
    }
  }

async function createDocumentHandler() {
  if (!newDocumentName.value.trim()) return
  try {
    const document = await createDocument({
      name: newDocumentName.value,
      type: newDocumentType.value
    })
    documentStore.addDocument(document)
    showCreateDialog.value = false
    newDocumentName.value = ''
    router.push(`/home/document/${document.id}`)
  } catch (err) {
    console.error(err)
    alert('创建文档失败')
  }
}
  return {
    showJoinDialog,
    showCreateDialog,
    documentIdInput,
    newDocumentName,
    newDocumentType,
    fileInputRef,
    triggerUpload,
    handleUpload,
    joinDocument,
    createDocumentHandler
  }
}
