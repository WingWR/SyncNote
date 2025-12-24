package com.syncnote.ai.dto.request;

import lombok.Data;

@Data
public class ContinueWriteRequest {
    private String context;     // 用户选中文本
    private Integer cursorIndex; // 光标位置，null 表示文末
    private String modelId;
    private String documentText;
}