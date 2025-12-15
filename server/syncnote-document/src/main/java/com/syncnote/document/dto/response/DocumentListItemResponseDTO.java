package com.syncnote.document.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class DocumentListItemResponseDTO {
    private Long id;
    private Long ownerId;
    private String fileName;
    private String fileType;          // "txt" | "md"
    private Long fileSize;
    private Boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
    private String permission;

}