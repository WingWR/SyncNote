import { ref, reactive } from 'vue'
import { useUserStore } from '../../stores/user'
import { updateUser } from '../../api/user'

export function useGlobalUserEditDialog() {
    // 全局用户编辑对话框状态
    const showEditDialog = ref(false)
    const editForm = reactive({
        username: '',
        password: '',
        avatarFile: null as File | null
    })

    const userStore = useUserStore()

    // 监听全局事件来打开编辑对话框
    function openEditDialog() {
        if (userStore.currentUser) {
            editForm.username = userStore.currentUser.username
            editForm.password = ''
            editForm.avatarFile = null
            showEditDialog.value = true
        }
    }

    async function handleUpdateUser() {
        try {
            if (!userStore.currentUser) return

            // 构建请求数据
            const updateData: any = {
                username: editForm.username
            }

            // 只在有新密码时包含密码
            if (editForm.password.trim()) {
                updateData.password = editForm.password
            }

            const response = await updateUser(updateData)
            userStore.setUser(response.data)
            showEditDialog.value = false

            // 清空表单
            editForm.password = ''
            editForm.avatarFile = null
        } catch (error) {
            console.error('更新用户信息失败:', error)
            alert('更新用户信息失败')
        }
    }

    function closeEditDialog() {
        showEditDialog.value = false
    }

    // 将函数暴露给全局使用
    ;(window as any).openUserEditDialog = openEditDialog

    return {
        showEditDialog,
        editForm,
        handleUpdateUser,
        closeEditDialog
    }
}
