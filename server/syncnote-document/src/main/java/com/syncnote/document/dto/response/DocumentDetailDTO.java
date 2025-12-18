package com.syncnote.document.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 文档详情响应DTO
 * 继承自DocumentDTO，额外包含contentUrl字段
 * 用于获取文档详情时的响应
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DocumentDetailDTO extends DocumentDTO {
    private String contentUrl;    // 临时签名 URL（用于访问文档内容）
}