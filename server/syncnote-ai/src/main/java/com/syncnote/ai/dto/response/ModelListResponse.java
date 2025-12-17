package com.syncnote.ai.dto.response;

import com.syncnote.ai.dto.ModelInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for model list endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelListResponse {
    private List<ModelInfo> models;
}