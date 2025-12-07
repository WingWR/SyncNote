package com.syncnote.ai.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for AI chat endpoint
 */
public class ChatRequest {
    
    @NotBlank(message = "Model ID is required")
    private String modelId;
    
    @NotBlank(message = "Mode is required")
    private String mode;
    
    private String message;
    
    private String context;
    
    private String documentId;

    public ChatRequest() {
    }

    public ChatRequest(String modelId, String mode, String message, String context, String documentId) {
        this.modelId = modelId;
        this.mode = mode;
        this.message = message;
        this.context = context;
        this.documentId = documentId;
    }

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }
}
