package com.syncnote.ai.dto.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
/**
 * Response DTO for AI chat endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    
    private String message;
    private String context;



   
}