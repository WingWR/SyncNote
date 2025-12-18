<template>
    <UserEditDialog
        :show-edit-dialog="showEditDialog"
        :form="editForm"
        @save="handleUpdateUser"
        @close="closeEditDialog"
    />
</template>

<script setup lang="ts">
import UserEditDialog from '../SystemSettings/UserEditDialog.vue'
import { useGlobalUserEditDialog } from '../../composables/global/useGlobalUserEditDialog'

const {
    showEditDialog,
    editForm,
    handleUpdateUser,
    closeEditDialog
} = useGlobalUserEditDialog()
</script>
