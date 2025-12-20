package com.syncnote.document.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
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

    private Instant updatedAt;
}
