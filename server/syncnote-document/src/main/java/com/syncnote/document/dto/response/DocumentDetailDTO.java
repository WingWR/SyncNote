package com.syncnote.document.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class DocumentDetailDTO extends DocumentListItemResponseDTO{
    private String contentUrl;    // 临时签名 URL
}