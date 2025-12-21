package com.syncnote.ai.service.impl;

import com.syncnote.ai.dto.response.ContinueWriteResponse;
import com.syncnote.ai.service.IContinueWriteService;
import com.syncnote.ai.service.IAIService;
import com.syncnote.ai.dto.request.ChatRequest;
import com.syncnote.document.service.IDocumentService;
import com.syncnote.util.context.CurrentUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContinueWriteServiceImpl implements IContinueWriteService {

    private final IAIService aiService;
    private final IDocumentService documentService;

    @Override
    public ContinueWriteResponse continueWrite(Long documentId, String context, String modelId) {
        // 仅用于构造 prompt，不真正解码 Yjs
        String base64State = documentService.getDocumentBinaryState(documentId);
        String prompt = (context == null || context.isBlank()) ? base64State : context;

        ChatRequest chatReq = new ChatRequest();
        chatReq.setModelId(modelId); 
        chatReq.setMessage(prompt);
        chatReq.setMode("continue");
        String suggested = aiService.processChat(chatReq,
                CurrentUserContext.getUserId().toString()).getReply();

        // -1 表示“文末”，前端可自己传光标覆盖
        return new ContinueWriteResponse(suggested, -1);
    }
}