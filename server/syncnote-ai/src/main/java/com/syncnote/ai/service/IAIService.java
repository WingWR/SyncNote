package com.syncnote.ai.service;

import com.syncnote.ai.dto.ChatRequest;
import com.syncnote.ai.dto.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;

import java.util.List;

public interface IAIService {

    /**
     * Process a chat request
     */
    ChatResponse processChat(ChatRequest request);

    /**
     * Get list of available models
     */
    List<ModelInfo> getAvailableModels();
}