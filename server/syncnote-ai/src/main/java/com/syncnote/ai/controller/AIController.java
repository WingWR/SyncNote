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
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Validated
@AllArgsConstructor
public class AIController {

    private final AIServiceImpl aiService;

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@RequestHeader("Authorization") String authHeader,
                                          @Valid @RequestBody ChatRequest request) {
        String token = extractToken(authHeader);
        ChatResponse response = aiService.processChat(request, token);
        return ApiResponse.succeed(response, "聊天成功");
    }

    @GetMapping("/models")
    public ApiResponse<List<ModelInfo>> models(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        List<ModelInfo> models = aiService.getAvailableModels(token);
        return ApiResponse.succeed(models, "获取模型列表成功");
    }
    private String extractToken(String authHeader) {
        return authHeader == null ? "" : authHeader.replace("Bearer", "").trim();
    }
}