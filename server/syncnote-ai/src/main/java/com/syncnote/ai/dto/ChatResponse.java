package com.syncnote.ai.dto;

/**
 * Response DTO for AI chat endpoint
 */
public class ChatResponse {
    
    private String message;
    private String context;

    public ChatResponse() {
    }

    public ChatResponse(String message, String context) {
        this.message = message;
        this.context = context;
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
}