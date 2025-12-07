package com.syncnote.ai.dto;

import java.util.List;

/**
 * Response DTO for model list endpoint
 */
public class ModelListResponse {
    
    private List<ModelInfo> models;

    public ModelListResponse() {
    }

    public ModelListResponse(List<ModelInfo> models) {
        this.models = models;
    }

    public List<ModelInfo> getModels() {
        return models;
    }

    public void setModels(List<ModelInfo> models) {
        this.models = models;
    }
}