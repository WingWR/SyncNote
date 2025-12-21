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
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

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
     /**
     * SSE 流式输出
     * 访问路径：/api/ai/chat/stream
     * 返回：text/event-stream
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ChatRequest request
    ) {
        String token = extractToken(authHeader);

        // 0L 表示不过期（也可以给一个毫秒超时，例如 60000L）
        SseEmitter emitter = new SseEmitter(0L);

        CompletableFuture.runAsync(() -> {
            try {
                // 先用你现有的同步逻辑拿到完整结果
                ChatResponse resp = aiService.processChat(request, token);
                String text = (resp == null || resp.getMessage() == null) ? "" : resp.getMessage();

                // 按片段推送（chunkSize 可自行调整）
                int chunkSize = 20;
                for (int i = 0; i < text.length(); i += chunkSize) {
                    String chunk = text.substring(i, Math.min(i + chunkSize, text.length()));

                    // 推荐用 JSON 结构，前端更好扩展
                    emitter.send(SseEmitter.event()
                            .name("message")
                            .data(Map.of("delta", chunk), MediaType.APPLICATION_JSON));
                }

                // 结束标记
                emitter.send(SseEmitter.event()
                        .name("done")
                        .data(Map.of("done", true), MediaType.APPLICATION_JSON));

                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(Map.of("error", e.getMessage()), MediaType.APPLICATION_JSON));
                } catch (IOException ignored) {
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
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