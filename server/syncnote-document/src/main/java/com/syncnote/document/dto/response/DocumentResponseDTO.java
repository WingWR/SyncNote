package com.syncnote.document.dto.response;

import lombok.Data;

import java.time.Instant;

/**
 * 文档响应DTO
 * 用于创建、更新、上传文档的响应
 */
@Data
public class DocumentResponseDTO {
    private Long id;
    private Long ownerId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long parentId;
    private Instant createdAt;
    private Instant updatedAt;
    private String permission;  // 当前用户对该文档的权限 ("WRITE" 或 "READ")
}

