package com.syncnote.ai.service.impl;

import com.syncnote.ai.dto.request.ChatRequest;
import com.syncnote.ai.dto.response.ContinueWriteResponse;
import com.syncnote.ai.service.IAIService;
import com.syncnote.ai.service.IContinueWriteService;
import com.syncnote.document.service.IDocumentService;
import com.syncnote.util.context.CurrentUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContinueWriteServiceImpl implements IContinueWriteService {

    private final IAIService aiService;
    private final IDocumentService documentService;

    // 纯文本做上下文时的长度上限，避免 prompt 过长
    private static final int MAX_DOC_TEXT_CHARS = 12000;
    private static final int MAX_SELECTED_TEXT_CHARS = 3000;

    @Override
    public ContinueWriteResponse continueWrite(Long documentId, String context, String modelId, String documentText) {
        // 优先使用前端传入的整篇纯文本；为空时回退到数据库中的 Yjs Base64 State
        String docText = (documentText == null || documentText.isBlank())
                ? null
                : truncateTail(documentText, MAX_DOC_TEXT_CHARS);

        // 仅用于兜底：数据库里存的是 Yjs base64 state（不可读文本）
        String base64StateFallback = null;
        if (docText == null) {
            base64StateFallback = documentService.getDocumentBinaryState(documentId);
        }

        String selected = (context == null || context.isBlank())
                ? null
                : truncateTail(context, MAX_SELECTED_TEXT_CHARS);

        // 构造 prompt：文档正文（优先纯文本） + 选中片段（如果有）
        String prompt;
        if (docText != null) {
            prompt = (selected == null) ? docText : (docText + "\n\n" + selected);
        } else {
            // 没有纯文本就用选中片段；选中片段也没有才用 base64 兜底
            prompt = (selected != null) ? selected : base64StateFallback;
        }

        ChatRequest chatReq = new ChatRequest();
        chatReq.setModelId(modelId);
        chatReq.setMessage(prompt);
        chatReq.setMode("continue");

        String suggested = aiService.processChat(
                chatReq,
                CurrentUserContext.getUserId().toString()
        ).getReply();

        // -1 表示“文末”，前端可自己传光标覆盖（本次不使用 cursorIndex）
        return new ContinueWriteResponse(suggested, -1);
    }

    private String truncateTail(String s, int maxChars) {
        if (s == null) return null;
        String t = s.trim();
        if (t.length() <= maxChars) return t;
        // 取尾部通常更贴近用户正在写的位置
        return t.substring(t.length() - maxChars);
    }
}
