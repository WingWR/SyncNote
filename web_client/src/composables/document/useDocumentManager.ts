import { ref } from "vue";
import { useRouter } from "vue-router";
import { useDocumentStore } from "../../stores/document";
import {
  createDocument,
  uploadDocument,
  getDocument,
  joinSharedDocument,
} from "../../api/document";

export function useDocumentManager() {
  const documentStore = useDocumentStore();
  const router = useRouter();

  // 弹窗状态
  const showJoinDialog = ref(false);
  const showCreateDialog = ref(false);

  // 输入状态
  const documentIdInput = ref("");
  const newDocumentName = ref("");
  const newDocumentType = ref<"txt" | "md" | "docx" | "pptx">("md");

  // 上传文件
  const fileInputRef = ref<HTMLInputElement | null>(null);

  function triggerUpload() {
    fileInputRef.value?.click();
  }

  async function handleUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadDocument(file);
      if (response.code === 200) {
        documentStore.addDocument(response.data);
        router.push(`/home/document/${response.data.id}`);
      } else {
        alert(response.message || "上传失败");
      }
    } catch (err) {
      console.error(err);
      alert("上传失败");
    }

    // 清空文件输入
    if (target) target.value = "";
  }

  async function joinDocument() {
    if (!documentIdInput.value) return;

    try {
      const docId = documentIdInput.value;
      // 调用加入共享文档接口，将当前用户添加为协作者（默认READ权限）
      const joinResponse = await joinSharedDocument(docId);
      if (joinResponse.code === 200) {
        // 加入成功后，获取文档详情
        const docResponse = await getDocument(docId);
        if (docResponse.code === 200) {
          documentStore.addDocument(docResponse.data);
          showJoinDialog.value = false;
          documentIdInput.value = "";
          router.push(`/home/document/${docResponse.data.id}`);
        } else {
          alert(docResponse.message || "获取文档失败");
        }
      } else {
        alert(joinResponse.message || "加入文档失败");
      }
    } catch (err) {
      console.error(err);
      alert("加入文档失败，请检查文档ID或您是否已有权限");
    }
  }

  async function createDocumentHandler() {
    if (!newDocumentName.value.trim()) return;

    try {
      const response = await createDocument({
        fileName: newDocumentName.value,
        fileType: newDocumentType.value,
      });
      if (response.code === 200) {
        documentStore.addDocument(response.data);
        showCreateDialog.value = false;
        newDocumentName.value = "";
        router.push(`/home/document/${response.data.id}`);
      } else {
        alert(response.message || "创建文档失败");
      }
    } catch (err) {
      console.error(err);
      alert("创建文档失败");
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
    createDocumentHandler,
  };
}
