package com.syncnote.ai.provider;

import com.syncnote.ai.config.AIProperties;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * OpenAI provider implementation using LangChain4j
 */
@Component
public class OpenAIProvider implements AIProvider {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIProvider.class);

    private final String modelId;
    private final ChatLanguageModel chatModel;
    private final boolean enabled;

    public OpenAIProvider(AIProperties aiProperties) {
        AIProperties.ProviderConfig config = aiProperties.getProviders().get("openai");
        if (config == null) {
            this.modelId = "gpt-3.5-turbo";
            this.enabled = false;
            this.chatModel = null;
            logger.warn("OpenAI provider config not found; provider disabled");
            return;
        }

        this.modelId = config.getModelId() != null ? config.getModelId() : "gpt-3.5-turbo";
        this.enabled = config.isEnabled() && config.getApiKey() != null && !config.getApiKey().isEmpty();

        if (this.enabled) {
            OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
                    .apiKey(config.getApiKey())
                    .modelName(this.modelId);

            if (config.getEndpoint() != null && !config.getEndpoint().isEmpty()) {
                builder.baseUrl(config.getEndpoint());
            }

            this.chatModel = builder.build();
            logger.info("OpenAI provider initialized with model: {}", this.modelId);
        } else {
            this.chatModel = null;
            logger.warn("OpenAI provider is disabled or not configured");
        }
    }

    @Override
    public String rewriteContinue(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("OpenAI provider is not enabled");
        }
        String fullPrompt = buildContinuePrompt(context, prompt);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String rewritePolish(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("OpenAI provider is not enabled");
        }
        String fullPrompt = buildPolishPrompt(context, prompt);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String qa(String context, String message) {
        if (!enabled) {
            throw new IllegalStateException("OpenAI provider is not enabled");
        }
        String fullPrompt = buildQaPrompt(context, message);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String getProviderId() {
        return "openai";
    }

    @Override
    public String getModelId() {
        return modelId;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    private String buildContinuePrompt(String context, String prompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Continue writing the following text without altering the prior content. ");
        if (prompt != null && !prompt.isEmpty()) {
            sb.append(prompt).append("\n\n");
        }
        sb.append("Context:\n").append(context != null ? context : "");
        return sb.toString();
    }

    private String buildPolishPrompt(String context, String prompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Lightly polish and improve the following text. Keep the original meaning and structure. ");
        if (prompt != null && !prompt.isEmpty()) {
            sb.append(prompt).append("\n\n");
        }
        sb.append("Text to polish:\n").append(context != null ? context : "");
        return sb.toString();
    }

    private String buildQaPrompt(String context, String message) {
        StringBuilder sb = new StringBuilder();
        if (context != null && !context.isEmpty()) {
            sb.append("Context:\n").append(context).append("\n\n");
        }
        sb.append("Question: ").append(message != null ? message : "");
        return sb.toString();
    }
}