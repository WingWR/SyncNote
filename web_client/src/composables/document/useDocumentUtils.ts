import { FileTextIcon } from 'lucide-vue-next'

/**
 * 文档相关的工具函数
 */
export function useDocumentUtils() {
  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number | string) => {
    // 将字符串转换为数字，如果转换失败则默认为0
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) || 0 : bytes || 0

    if (numBytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 格式化日期
   */
  const formatDate = (dateString: string | null) => {
    // 如果日期为空，返回默认提示
    if (!dateString) return '未知时间'

    const date = new Date(dateString)

    // 检查日期是否有效
    if (isNaN(date.getTime())) return '无效时间'

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  /**
   * 获取文件图标
   */
  const getFileIcon = (_fileType: string) => {
    return FileTextIcon // 简化处理，都使用文件图标
  }

  /**
   * 获取文件类型颜色
   */
  const getFileTypeColor = (fileType: string) => {
    const colors: Record<string, string> = {
      'txt': 'bg-gray-500',
      'md': 'bg-blue-500',
      'docx': 'bg-indigo-500',
      'pptx': 'bg-orange-500'
    }
    return colors[fileType] || 'bg-gray-500'
  }

  return {
    formatFileSize,
    formatDate,
    getFileIcon,
    getFileTypeColor
  }
}
