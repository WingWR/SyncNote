package com.syncnote.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ContinueWriteResponse {
    private String suggestedText;
    private int insertPos;   // -1 代表文末
}