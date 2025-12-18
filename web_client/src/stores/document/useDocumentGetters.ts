// 前端文件编辑部分派生状态定义
import { computed } from "vue";
import type { Document } from "./types";

export function useDocumentGetters(state: {
  documents: { value: Document[] };
}) {
  const documentsWithPermission = computed(() => {
    return state.documents.value.filter((doc) => doc.permission === "WRITE");
  });

  const documentsWithoutPermission = computed(() => {
    return state.documents.value.filter(
      (doc) => !doc.permission || doc.permission === "READ"
    );
  });

  return {
    documentsWithPermission,
    documentsWithoutPermission,
  };
}
