package com.syncnote.ai.provider;

import com.syncnote.ai.config.AiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Mock provider for testing and demonstration
 */
@Component
public class MockProvider implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(MockProvider.class);

    private final String modelId;
    private final boolean enabled;

    public MockProvider(AiProperties aiProperties) {
        AiProperties.ProviderConfig config = aiProperties.getProviders().get("mock");
        if (config == null) {
            this.modelId = "mock-model";
            this.enabled = false;
            logger.warn("Mock provider config not found; provider disabled");
            return;
        }

        this.modelId = config.getModelId() != null ? config.getModelId() : "mock-model";
        this.enabled = config.isEnabled();

        if (this.enabled) {
            logger.info("Mock provider initialized with model: {}", this.modelId);
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