package com.syncnote.document.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 上传文档请求DTO（可选）
 * 如果需要额外的参数可以扩展此类
 * 目前主要使用 MultipartFile 作为参数
 */
@Data
public class UploadDocumentRequestDTO {
    
    /**
     * 上传的文件
     */
    private MultipartFile file;

    /**
     * 父目录ID（可选）
     */
    private Long parentId;
}

