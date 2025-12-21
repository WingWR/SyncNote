package com.syncnote.document.handler;

import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DocumentSyncHandler extends BinaryWebSocketHandler {

    // 内存中维护在线状态：key 是 docId, value 是该文档的所有在线 Session
    private static final Map<String, Set<WebSocketSession>> documentSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        String docId = extractDocId(session);
        if (docId != null) {
            documentSessions.computeIfAbsent(docId, k -> ConcurrentHashMap.newKeySet()).add(session);
            System.out.println("[WebSocket] 用户连接文档: " + docId + ", 当前房间人数: " + documentSessions.get(docId).size());
        }
    }

    @Override
    protected void handleBinaryMessage(@NonNull WebSocketSession session, @NonNull BinaryMessage message) throws IOException {
        String docId = extractDocId(session);
        if (docId == null) return;

        Set<WebSocketSession> sessions = documentSessions.get(docId);
        if (sessions != null) {
            // 广播：将收到的 Yjs 二进制更新发送给房间内除自己外的所有人
            for (WebSocketSession s : sessions) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        String docId = extractDocId(session);
        if (docId != null && documentSessions.containsKey(docId)) {
            Set<WebSocketSession> sessions = documentSessions.get(docId);
            sessions.remove(session);
            if (sessions.isEmpty()) {
                documentSessions.remove(docId);
            }
            System.out.println("[WebSocket] 用户离开文档: " + docId);
        }
    }

    private String extractDocId(WebSocketSession session) {
        // 从路径中解析 docId: /ws/document/123 -> 123
        String path = Objects.requireNonNull(session.getUri()).getPath();
        String[] parts = path.split("/");
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        return null;
    }
}
