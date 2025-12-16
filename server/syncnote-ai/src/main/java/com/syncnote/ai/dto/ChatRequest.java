package com.syncnote.ai.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for AI chat endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    
    @NotBlank(message = "Model ID is required")
    private String modelId;
    
    @NotBlank(message = "Mode is required")
    private String mode;
    
    private String message;
    
    private String context;
    
    private String documentId;


}