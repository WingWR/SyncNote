package com.syncnote.ai.provider;

import com.syncnote.ai.config.AiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Registry for managing AI providers
 */
@Component
public class ProviderRegistry {
    
    private static final Logger logger = LoggerFactory.getLogger(ProviderRegistry.class);
    
    private final Map<String, AiProvider> providers = new HashMap<>();
    private final AiProperties aiProperties;
    
    public ProviderRegistry(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        initializeProviders();
    }
    
    private void initializeProviders() {
        logger.info("Initializing AI providers...");
        
        // Initialize OpenAI provider if configured
        AiProperties.ProviderConfig openAiConfig = aiProperties.getProviders().get("openai");
        if (openAiConfig != null) {
            OpenAiProvider openAiProvider = new OpenAiProvider(openAiConfig);
            if (openAiProvider.isEnabled()) {
                registerProvider(openAiProvider.getModelId(), openAiProvider);
                logger.info("Registered OpenAI provider with model: {}", openAiProvider.getModelId());
            }
        }
        
        // Initialize Mock provider if configured
        AiProperties.ProviderConfig mockConfig = aiProperties.getProviders().get("mock");
        if (mockConfig != null) {
            MockProvider mockProvider = new MockProvider(mockConfig);
            if (mockProvider.isEnabled()) {
                registerProvider(mockProvider.getModelId(), mockProvider);
                logger.info("Registered Mock provider with model: {}", mockProvider.getModelId());
            }
        }
        
        logger.info("Initialized {} AI provider(s)", providers.size());
    }
    
    /**
     * Register a provider with a model ID
     */
    public void registerProvider(String modelId, AiProvider provider) {
        providers.put(modelId, provider);
    }
    
    /**
     * Get a provider by model ID
     */
    public Optional<AiProvider> getProvider(String modelId) {
        return Optional.ofNullable(providers.get(modelId));
    }
    
    /**
     * Get all registered providers
     */
    public Map<String, AiProvider> getAllProviders() {
        return new HashMap<>(providers);
    }
    
    /**
     * Check if a model is available
     */
    public boolean hasProvider(String modelId) {
        return providers.containsKey(modelId);
    }
}