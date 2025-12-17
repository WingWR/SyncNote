package com.syncnote.ai.provider;

import com.syncnote.ai.config.TheAiProperties;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MockProviderThe
 */
class MockProviderTest {
    
    @Test
    void testMockProviderEnabled() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(true);
        config.setModelId("test-model");
        
        MockProviderThe provider = new MockProviderThe(config);
        
        assertTrue(provider.isEnabled());
        assertEquals("test-model", provider.getModelId());
        assertEquals("mock", provider.getProviderId());
    }
    
    @Test
    void testMockProviderDisabled() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(false);
        
        MockProviderThe provider = new MockProviderThe(config);
        
        assertFalse(provider.isEnabled());
    }
    
    @Test
    void testRewriteContinue() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProviderThe provider = new MockProviderThe(config);
        
        String result = provider.rewriteContinue("This is some context", "continue writing");
        assertNotNull(result);
        assertTrue(result.contains("MOCK CONTINUE"));
    }
    
    @Test
    void testRewritePolish() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProviderThe provider = new MockProviderThe(config);
        
        String result = provider.rewritePolish("This is some text to polish", null);
        assertNotNull(result);
        assertTrue(result.contains("MOCK POLISH"));
    }
    
    @Test
    void testQa() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(true);
        
        MockProviderThe provider = new MockProviderThe(config);
        
        String result = provider.qa("Some context", "What is this about?");
        assertNotNull(result);
        assertTrue(result.contains("MOCK QA"));
    }
    
    @Test
    void testDisabledProviderThrowsException() {
        TheAiProperties.ProviderConfig config = new TheAiProperties.ProviderConfig();
        config.setEnabled(false);
        
        MockProviderThe provider = new MockProviderThe(config);
        
        assertThrows(IllegalStateException.class, () -> 
            provider.rewriteContinue("context", "prompt")
        );
    }
}