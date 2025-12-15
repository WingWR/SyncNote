package com.syncnote.document.dto.request;

import com.syncnote.document.model.DocumentFileType;
import lombok.Data;

import jakarta.validation.constraints.Pattern;

/**
 * 更新文档请求DTO
 */
@Data
public class UpdateDocumentRequestDTO {
    
    private String fileName;

    @Pattern(regexp = DocumentFileType.REGEX_PATTERN, message = DocumentFileType.VALIDATION_MESSAGE)
    private String fileType;

    /**
     * 父目录ID（可选，用于移动文档）
     */
    private Long parentId;
}

