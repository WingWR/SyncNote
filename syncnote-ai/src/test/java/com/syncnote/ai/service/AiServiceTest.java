package com.syncnote.ai.service;

import com.syncnote.ai.config.AIProperties;
import com.syncnote.ai.dto.request.ChatRequest;
import com.syncnote.ai.dto.response.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.provider.impl.MockProvider;
import com.syncnote.ai.provider.ProviderRegistry;
import com.syncnote.ai.service.impl.AIServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AIServiceImpl
 */
class AiServiceTest {

    private AIServiceImpl aiService;
    private static final String TEST_TOKEN = "test-token";

    @BeforeEach
    void setUp() {
        AIProperties AIProperties = new AIProperties();
        AIProperties.ProviderConfig mockConfig = new AIProperties.ProviderConfig();
        mockConfig.setEnabled(true);
        mockConfig.setModelId("test-model");
        AIProperties.getProviders().put("mock", mockConfig);

        MockProvider mockProvider = new MockProvider(AIProperties);
        ProviderRegistry providerRegistry = new ProviderRegistry(List.of(mockProvider));
        aiService = new AIServiceImpl(providerRegistry);
    }

    @Test
    void testProcessChatWithContinueMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("continue");
        request.setContext("Some context");
        request.setMessage("Continue writing");

        ChatResponse response = aiService.processChat(request, "test-token");

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().contains("MOCK CONTINUE"));
    }

    @Test
    void testProcessChatWithPolishMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("polish");
        request.setContext("Text to polish");

        ChatResponse response = aiService.processChat(request, "test-token");

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().contains("MOCK POLISH"));
    }

    @Test
    void testProcessChatWithQaMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("chat");
        request.setMessage("What is this?");

        ChatResponse response = aiService.processChat(request, TEST_TOKEN);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().contains("MOCK QA"));
    }

    @Test
    void testProcessChatWithInvalidModelId() {
        ChatRequest request = new ChatRequest();
        request.setModelId("invalid-model");
        request.setMode("continue");
        request.setContext("Some context");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> aiService.processChat(request, TEST_TOKEN));
        assertTrue(ex.getMessage().contains("Invalid model ID"));
    }

    @Test
    void testProcessChatWithInvalidMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("invalid-mode");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> aiService.processChat(request, TEST_TOKEN));
        assertTrue(ex.getMessage().contains("Invalid mode"));
    }

    @Test
    void testGetAvailableModels() {
        List<ModelInfo> models = aiService.getAvailableModels(TEST_TOKEN);

        assertNotNull(models);
        assertEquals(1, models.size());
        assertEquals("test-model", models.getFirst().getId());
        assertEquals("mock", models.getFirst().getProvider());
    }

    @Test
    void testModeAliases() {
        // rewrite-continue alias
        ChatRequest request1 = new ChatRequest();
        request1.setModelId("test-model");
        request1.setMode("rewrite-continue");
        request1.setContext("context");

        ChatResponse response1 = aiService.processChat(request1, TEST_TOKEN);
        assertNotNull(response1);
        assertTrue(response1.getMessage().contains("MOCK CONTINUE"));

        // rewrite-polish alias
        ChatRequest request2 = new ChatRequest();
        request2.setModelId("test-model");
        request2.setMode("rewrite-polish");
        request2.setContext("context");

        ChatResponse response2 = aiService.processChat(request2, TEST_TOKEN);
        assertNotNull(response2);
        assertTrue(response2.getMessage().contains("MOCK POLISH"));

        // agent alias
        ChatRequest request3 = new ChatRequest();
        request3.setModelId("test-model");
        request3.setMode("agent");
        request3.setMessage("question");

        ChatResponse response3 = aiService.processChat(request3, TEST_TOKEN);
        assertNotNull(response3);
        assertTrue(response3.getMessage().contains("MOCK QA"));
    }
}