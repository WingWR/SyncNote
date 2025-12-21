package com.syncnote.document.config;

import com.syncnote.document.handler.DocumentSyncHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private DocumentSyncHandler documentSyncHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 映射路径，并允许跨域（重要：开发环境 *）
        registry.addHandler(documentSyncHandler, "/ws/document/{docId}")
                .setAllowedOrigins("*");
    }
}
