package com.syncnote.ai.service;

import com.syncnote.ai.dto.response.ContinueWriteResponse;

public interface IContinueWriteService {
    ContinueWriteResponse continueWrite(Long documentId, String context, String modelId,String documentText);
}
