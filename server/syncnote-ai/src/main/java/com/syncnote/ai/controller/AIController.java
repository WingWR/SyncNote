package com.syncnote.ai.controller;

import com.syncnote.ai.dto.ChatRequest;
import com.syncnote.ai.dto.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.service.IAIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Validated
public class AIController {

    private final IAIService aiService;

    public AIController(IAIService aiService) {
        this.aiService = aiService;
    }

    /**
     * 统一对接：支持 mode=continue / rewrite-continue、polish / rewrite-polish、chat/qa/agent
     * ChatRequest 需要携带：
     *   - modelId: 对应 ProviderRegistry 已注册的模型
     *   - mode: 上述任一模式
     *   - context: 原文/上下文（续写、润色、问答可用）
     *   - message: 续写/润色的指令或问答的问题
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiService.processChat(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取可用模型列表
     */
    @GetMapping("/models")
    public ResponseEntity<List<ModelInfo>> models() {
        return ResponseEntity.ok(aiService.getAvailableModels());
    }
}