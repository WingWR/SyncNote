package com.syncnote.document.dto.request;

import com.syncnote.document.model.DocumentFileType;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 创建文档请求DTO
 * 用于创建空白文档，可选的模板ID用于从模板创建
 */
@Data
public class CreateDocumentRequestDTO {
    
    @NotBlank(message = "文件名不能为空")
    private String fileName;

    @NotBlank(message = "文件类型不能为空")
    @Pattern(regexp = DocumentFileType.REGEX_PATTERN, message = DocumentFileType.VALIDATION_MESSAGE)
    private String fileType;

    /**
     * 父目录ID（可选）
     */
    private Long parentId;

    /**
     * 模板ID（可选），如果提供则从模板创建文档
     */
    private Long templateId;
}

