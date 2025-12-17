package com.syncnote.ai.provider;

import com.syncnote.ai.config.AIProperties;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MockProvider
 */
class MockProviderTest {
    
    @Test
    void testMockProviderEnabled() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(true);
        config.setModelId("test-model");
        
        MockProvider provider = new MockProvider(config);
        
        assertTrue(provider.isEnabled());
        assertEquals("test-model", provider.getModelId());
        assertEquals("mock", provider.getProviderId());
    }
    
    @Test
    void testMockProviderDisabled() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(false);
        
        MockProvider provider = new MockProvider(config);
        
        assertFalse(provider.isEnabled());
    }
    
    @Test
    void testRewriteContinue() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProvider provider = new MockProvider(config);
        
        String result = provider.rewriteContinue("This is some context", "continue writing");
        assertNotNull(result);
        assertTrue(result.contains("MOCK CONTINUE"));
    }
    
    @Test
    void testRewritePolish() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProvider provider = new MockProvider(config);
        
        String result = provider.rewritePolish("This is some text to polish", null);
        assertNotNull(result);
        assertTrue(result.contains("MOCK POLISH"));
    }
    
    @Test
    void testQa() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProvider provider = new MockProvider(config);
        
        String result = provider.qa("Some context", "What is this about?");
        assertNotNull(result);
        assertTrue(result.contains("MOCK QA"));
    }
    
    @Test
    void testDisabledProviderThrowsException() {
        AIProperties.ProviderConfig config = new AIProperties.ProviderConfig();
        config.setEnabled(false);
        
        MockProvider provider = new MockProvider(config);
        
        assertThrows(IllegalStateException.class, () -> 
            provider.rewriteContinue("context", "prompt")
        );
    }
}