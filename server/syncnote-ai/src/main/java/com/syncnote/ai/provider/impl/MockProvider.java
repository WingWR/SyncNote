package com.syncnote.ai.provider.impl;

import com.syncnote.ai.config.AIProperties;
import com.syncnote.ai.provider.AIProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Mock provider for testing and demonstration
 */
@Component
public class MockProvider implements AIProvider {

    private static final Logger logger = LoggerFactory.getLogger(MockProvider.class);

    private final String modelId;
    private final boolean enabled;

    /**
     * Spring 使用的构造函数：从 AIProperties 中读取 "mock" 配置
     */
    @Autowired
    public MockProvider(AIProperties aiProperties) {
        this(aiProperties != null ? aiProperties.getProviders().get("mock") : null);
    }

    /**
     * 便于单测的构造函数：直接传入 ProviderConfig
     */
    MockProvider(AIProperties.ProviderConfig config) {
        this.modelId = config != null && config.getModelId() != null ? config.getModelId() : "mock-model";
        this.enabled = config != null && config.isEnabled();

        if (this.enabled) {
            logger.info("Mock provider initialized with model: {}", this.modelId);
        } else {
            logger.warn("Mock provider is disabled or no config provided");
        }
    }

    @Override
    public String rewriteContinue(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("Mock provider is not enabled");
        }

        return "[MOCK CONTINUE] Based on: " + (context != null ? context.substring(0, Math.min(50, context.length())) : "empty context") + "...";
    }

    @Override
    public String rewritePolish(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("Mock provider is not enabled");
        }

        return "[MOCK POLISH] Polished version of: " + (context != null ? context.substring(0, Math.min(50, context.length())) : "empty context") + "...";
    }

    @Override
    public String qa(String context, String message) {
        if (!enabled) {
            throw new IllegalStateException("Mock provider is not enabled");
        }

        return "[MOCK QA] Answer to '" + (message != null ? message : "no question") + "': This is a mock response.";
    }

    @Override
    public String getProviderId() {
        return "mock";
    }

    @Override
    public String getModelId() {
        return modelId;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}