package com.syncnote.ai.service;

import com.syncnote.ai.dto.ChatRequest;
import com.syncnote.ai.dto.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.provider.AiProvider;
import com.syncnote.ai.provider.ProviderRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Unified AI service for handling AI operations
 */
@Service
public class AiService {
    
    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    
    private final ProviderRegistry providerRegistry;
    
    public AiService(ProviderRegistry providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    
    /**
     * Process a chat request
     */
    public ChatResponse processChat(ChatRequest request) {
        logger.debug("Processing chat request for model: {}, mode: {}", request.getModelId(), request.getMode());
        
        // Get the provider
        AiProvider provider = providerRegistry.getProvider(request.getModelId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid model ID: " + request.getModelId()));
        
        // Dispatch based on mode
        String result;
        String mode = request.getMode().toLowerCase();
        if (mode.equals("continue") || mode.equals("rewrite-continue")) {
            result = provider.rewriteContinue(request.getContext(), request.getMessage());
        } else if (mode.equals("polish") || mode.equals("rewrite-polish")) {
            result = provider.rewritePolish(request.getContext(), request.getMessage());
        } else if (mode.equals("chat") || mode.equals("qa") || mode.equals("agent")) {
            result = provider.qa(request.getContext(), request.getMessage());
        } else {
            throw new IllegalArgumentException("Invalid mode: " + request.getMode());
        }
        
        return new ChatResponse(result, request.getContext());
    }
    
    /**
     * Get list of available models
     */
    public List<ModelInfo> getAvailableModels() {
        logger.debug("Getting available models");
        
        Map<String, AiProvider> providers = providerRegistry.getAllProviders();
        
        return providers.entrySet().stream()
                .map(entry -> new ModelInfo(
                        entry.getKey(),
                        entry.getKey(), // Using model ID as name for now
                        entry.getValue().getProviderId()
                ))
                .collect(Collectors.toList());
    }
}
