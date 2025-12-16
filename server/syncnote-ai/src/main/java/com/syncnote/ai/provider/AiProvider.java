package com.syncnote.ai.provider;

/**
 * Interface for AI provider operations
 */
public interface AIProvider {
    
    /**
     * Continue writing without altering prior content
     * 
     * @param context The existing content
     * @param prompt Additional prompt/instruction
     * @return The continued text
     */
    String rewriteContinue(String context, String prompt);
    
    /**
     * Lightly polish existing content
     * 
     * @param context The content to polish
     * @param prompt Additional prompt/instruction
     * @return The polished text
     */
    String rewritePolish(String context, String prompt);
    
    /**
     * Answer questions without mutating the document (chat-only)
     * 
     * @param context Document context (optional)
     * @param message The question to answer
     * @return The answer
     */
    String qa(String context, String message);
    
    /**
     * Get the provider identifier
     * 
     * @return The provider name
     */
    String getProviderId();
    
    /**
     * Get the model identifier
     * 
     * @return The model ID
     */
    String getModelId();
    
    /**
     * Check if the provider is enabled/configured
     * 
     * @return true if enabled, false otherwise
     */
    boolean isEnabled();
}