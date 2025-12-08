package com.syncnote.ai.dto;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for AI chat endpoint
 */
@Data
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
}