package com.syncnote.document.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 协作者响应DTO
 * 用于返回文档协作者信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorResponseDTO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long documentId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    private String permission;  // "READ" 或 "WRITE" (大写)
    private Instant joinedAt;   // 对应数据库中的createdAt字段
}
