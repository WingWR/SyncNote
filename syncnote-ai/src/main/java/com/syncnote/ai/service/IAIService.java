package com.syncnote.ai.service;

import com.syncnote.ai.dto.request.ChatRequest;
import com.syncnote.ai.dto.response.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;

import java.util.List;

public interface IAIService {

    /**
     * Process a chat request
     * @param request chat payload
     * @param token   user auth token (Bearer stripped)
     */
    ChatResponse processChat(ChatRequest request, String token);

    /**
     * Get list of available models
     * @param token user auth token (Bearer stripped)
     */
    List<ModelInfo> getAvailableModels(String token);
}
