package com.syncnote.ai.dto;

import java.util.List;
import lombok.Data;
/**
 * Response DTO for model list endpoint
 */
@Data
public class ModelListResponse {
    
    private List<ModelInfo> models;

    public ModelListResponse() {
    }

    public ModelListResponse(List<ModelInfo> models) {
        this.models = models;
    }

}