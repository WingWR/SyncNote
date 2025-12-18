package com.syncnote.document.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新协作者权限请求DTO
 */
@Data
public class UpdateCollaboratorPermissionRequestDTO {
    @NotNull(message = "权限不能为空")
    private String permission;  // "READ" 或 "WRITE" (大写)
}

