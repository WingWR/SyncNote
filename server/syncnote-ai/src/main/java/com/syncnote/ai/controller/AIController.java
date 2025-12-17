package com.syncnote.ai.controller;

import com.syncnote.ai.dto.request.ChatRequest;
import com.syncnote.ai.dto.response.ChatResponse;
import com.syncnote.ai.dto.ModelInfo;
import com.syncnote.ai.service.impl.AIServiceImpl;
import com.syncnote.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
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
@AllArgsConstructor
public class AIController {

    private final AIServiceImpl aiService;

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiService.processChat(request);
        return ApiResponse.succeed(response, "聊天成功");
    }

    @GetMapping("/models")
    public ApiResponse<List<ModelInfo>> models() {
        List<ModelInfo> models = aiService.getAvailableModels();
        return ApiResponse.succeed(models, "获取模型列表成功");
    }
}