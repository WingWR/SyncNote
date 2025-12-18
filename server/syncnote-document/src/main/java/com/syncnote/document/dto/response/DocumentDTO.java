package com.syncnote.document.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.Instant;

/**
 * 文档统一响应DTO
 * 用于所有文档相关的响应（创建、更新、上传、列表、详情等）
 * 包含文档的所有基础信息
 */
@Data
public class DocumentDTO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long ownerId;
    private String fileName;
    private String fileType;          // "txt" | "md" | "docx" | "pptx"
    private Long fileSize;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long parentId;             // 父目录ID，可为null（根目录）
    private Boolean isDeleted;         // 是否已删除（软删除标记）
    private Instant createdAt;
    private Instant updatedAt;
    private String permission;         // 当前用户对该文档的权限 ("WRITE" 或 "READ")
}

