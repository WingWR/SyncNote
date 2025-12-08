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
        logger.debug("Processing chat request for model: {}", request.getModelId());

        AiProvider provider = providerRegistry.getProvider(request.getModelId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid model ID: " + request.getModelId()));

        String mode = request.getMode();
        String message = request.getMessage();
        String context = request.getContext();

        switch (mode.toLowerCase()) {
            case "continue":
            case "rewrite-continue":
                return new ChatResponse(provider.rewriteContinue(context, message), context);
            case "polish":
            case "rewrite-polish":
                return new ChatResponse(provider.rewritePolish(context, message), context);
            case "chat":
            case "qa":
            case "agent":
                return new ChatResponse(provider.qa(context, message), context);
            default:
                throw new IllegalArgumentException("Invalid mode: " + mode);
        }
    }

    /**
     * Get list of available models
     */
    public List<ModelInfo> getAvailableModels() {
        logger.debug("Getting available models");

        Map<String, AiProvider> providers = providerRegistry.getAllProviders();

        return providers.entrySet().stream()
                .map(entry -> new ModelInfo(
                        entry.getKey(),                // modelId
                        entry.getKey(),                // name (reuse modelId as display name)
                        entry.getValue().getProviderId() // providerId
                ))
                .collect(Collectors.toList());
    }
}