package com.syncnote.document.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.Instant;

@Data
@TableName("document_chunk")
public class DocumentChunk {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long documentId;

    private Integer chunkIndex;

    private String content;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Instant updatedAt;
}
