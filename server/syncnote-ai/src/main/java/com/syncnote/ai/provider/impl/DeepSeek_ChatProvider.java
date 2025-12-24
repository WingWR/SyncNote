package com.syncnote.ai.provider.impl;

import com.syncnote.ai.config.AIProperties;
import com.syncnote.ai.provider.IAIProvider;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
/**
 * DeepSeek provider implementation (OpenAI-compatible)
 */
@Component
public class DeepSeek_ChatProvider implements IAIProvider {


    private static final Logger logger = LoggerFactory.getLogger(DeepSeek_ChatProvider.class);

    private final String modelId;
    private final ChatLanguageModel chatModel;
    private final boolean enabled;

    public DeepSeek_ChatProvider(AIProperties aiProperties) {
        AIProperties.ProviderConfig config = aiProperties.getProviders().get("deepseek_chat");
        if (config == null) {
            this.modelId = "deepseek-chat";
            this.enabled = false;
            this.chatModel = null;
            logger.warn("DeepSeek provider config not found; provider disabled");
            return;
        }

        this.modelId = config.getModelId() != null ? config.getModelId() : "deepseek-chat";
        this.enabled = config.isEnabled()
                && config.getApiKey() != null
                && !config.getApiKey().isEmpty();

        if (this.enabled) {
            OpenAiChatModel.OpenAiChatModelBuilder builder = OpenAiChatModel.builder()
                    .apiKey(config.getApiKey())
                    .modelName(this.modelId);

            if (config.getEndpoint() != null && !config.getEndpoint().isEmpty()) {
                builder.baseUrl(config.getEndpoint());
            }

            this.chatModel = builder.build();
            logger.info("DeepSeek provider initialized with model: {}", this.modelId);
        } else {
            this.chatModel = null;
            logger.warn("DeepSeek provider is disabled or not configured");
        }
    }

    @Override
    public String rewriteContinue(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("DeepSeek provider is not enabled");
        }
        String fullPrompt = buildContinuePrompt(context, prompt);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String rewritePolish(String context, String prompt) {
        if (!enabled) {
            throw new IllegalStateException("DeepSeek provider is not enabled");
        }
        String fullPrompt = buildPolishPrompt(context, prompt);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String qa(String context, String message) {
        if (!enabled) {
            throw new IllegalStateException("DeepSeek provider is not enabled");
        }
        String fullPrompt = buildQaPrompt(context, message);
        return chatModel.generate(fullPrompt);
    }

    @Override
    public String getProviderId() {
        return "deepseek";
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