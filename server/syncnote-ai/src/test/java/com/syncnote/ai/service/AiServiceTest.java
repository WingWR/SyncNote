package com.syncnote.ai.service;

import com.syncnote.ai.config.AiProperties;
import com.syncnote.ai.dto.ChatRequest;
import com.syncnote.ai.dto.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.provider.MockProvider;
import com.syncnote.ai.provider.ProviderRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AiService
 */
class AiServiceTest {
    
    private AiService aiService;
    private ProviderRegistry providerRegistry;
    
    @BeforeEach
    void setUp() {
        AiProperties aiProperties = new AiProperties();
        AiProperties.ProviderConfig mockConfig = new AiProperties.ProviderConfig();
        mockConfig.setEnabled(true);
        mockConfig.setModelId("test-model");
        aiProperties.getProviders().put("mock", mockConfig);
        
        providerRegistry = new ProviderRegistry(aiProperties);
        aiService = new AiService(providerRegistry);
    }
    
    @Test
    void testProcessChatWithContinueMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("continue");
        request.setContext("Some context");
        request.setMessage("Continue writing");
        
        ChatResponse response = aiService.processChat(request);
        
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
        
        ChatResponse response = aiService.processChat(request);
        
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
        
        ChatResponse response = aiService.processChat(request);
        
        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().contains("MOCK QA"));
    }
    
    @Test
    void testProcessChatWithInvalidModelId() {
        ChatRequest request = new ChatRequest();
        request.setModelId("invalid-model");
        request.setMode("chat");
        
        assertThrows(IllegalArgumentException.class, () -> 
            aiService.processChat(request)
        );
    }
    
    @Test
    void testProcessChatWithInvalidMode() {
        ChatRequest request = new ChatRequest();
        request.setModelId("test-model");
        request.setMode("invalid-mode");
        
        assertThrows(IllegalArgumentException.class, () -> 
            aiService.processChat(request)
        );
    }
    
    @Test
    void testGetAvailableModels() {
        List<ModelInfo> models = aiService.getAvailableModels();
        
        assertNotNull(models);
        assertFalse(models.isEmpty());
        
        ModelInfo model = models.get(0);
        assertEquals("test-model", model.getId());
        assertEquals("mock", model.getProvider());
    }
    
    @Test
    void testModeAliases() {
        // Test rewrite-continue alias
        ChatRequest request1 = new ChatRequest();
        request1.setModelId("test-model");
        request1.setMode("rewrite-continue");
        request1.setContext("context");
        
        ChatResponse response1 = aiService.processChat(request1);
        assertNotNull(response1);
        assertTrue(response1.getMessage().contains("MOCK CONTINUE"));
        
        // Test rewrite-polish alias
        ChatRequest request2 = new ChatRequest();
        request2.setModelId("test-model");
        request2.setMode("rewrite-polish");
        request2.setContext("context");
        
        ChatResponse response2 = aiService.processChat(request2);
        assertNotNull(response2);
        assertTrue(response2.getMessage().contains("MOCK POLISH"));
        
        // Test agent alias
        ChatRequest request3 = new ChatRequest();
        request3.setModelId("test-model");
        request3.setMode("agent");
        request3.setMessage("question");
        
        ChatResponse response3 = aiService.processChat(request3);
        assertNotNull(response3);
        assertTrue(response3.getMessage().contains("MOCK QA"));
    }
}