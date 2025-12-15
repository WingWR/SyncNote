package com.syncnote.document.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 添加协作者请求DTO
 */
@Data
public class AddCollaboratorRequestDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "权限不能为空")
    private String permission;  // "READ" 或 "WRITE" (大写)
}
