package com.syncnote.ai.controller;

import com.syncnote.ai.dto.ChatRequest;
import com.syncnote.ai.dto.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.dto.ModelListResponse;
import com.syncnote.ai.service.AiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST controller for AI operations
 * 
 * Note: Security (Bearer token authentication) should be configured
 * at the application level in the Boot module's security configuration.
 * These endpoints are designed to work with the existing security conventions.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    
    private final AiService aiService;
    
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }
    
    /**
     * POST /api/ai/chat - Process AI chat request
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatRequest request) {
        try {
            logger.info("Received chat request for model: {}, mode: {}", request.getModelId(), request.getMode());
            ChatResponse response = aiService.processChat(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error processing chat request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Internal server error"));
        }
    }
    
    /**
     * GET /api/ai/models - Get available AI models
     */
    @GetMapping("/models")
    public ResponseEntity<ModelListResponse> getModels() {
        try {
            logger.info("Fetching available models");
            List<ModelInfo> models = aiService.getAvailableModels();
            return ResponseEntity.ok(new ModelListResponse(models));
        } catch (Exception e) {
            logger.error("Error fetching models", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
