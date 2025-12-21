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

            if (response.code === 200) {
                // 直接使用API返回的用户信息更新store
                if (response.data) {
                    userStore.setUser(response.data)
                } else {
                    // 如果API没有返回用户数据，手动构造更新后的用户数据
                    const currentUser = userStore.currentUser
                    if (currentUser) {
                        const updatedUser = {
                            ...currentUser,
                            username: editForm.username,
                            // 如果有新密码，也更新（虽然通常密码不会在响应中返回）
                        }
                        userStore.setUser(updatedUser)
                    }
                }
            } else {
                throw new Error(`更新失败: ${response.message || '未知错误'} (状态码: ${response.code})`)
            }

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
