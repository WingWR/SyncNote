package com.syncnote.ai.dto;
import lombok.Data;
/**
 * Response DTO for AI chat endpoint
 */
@Data
public class ChatResponse {
    
    private String message;
    private String context;

    public ChatResponse() {
    }

    public ChatResponse(String message, String context) {
        this.message = message;
        this.context = context;
    }

   
}