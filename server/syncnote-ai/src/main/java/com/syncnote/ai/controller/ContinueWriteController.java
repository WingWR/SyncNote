package com.syncnote.ai.controller;

import com.syncnote.util.ApiResponse;
import com.syncnote.ai.dto.request.ContinueWriteRequest;
import com.syncnote.ai.dto.response.ContinueWriteResponse;
import com.syncnote.ai.service.IContinueWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents/{documentId}/continue-write")
@RequiredArgsConstructor
public class ContinueWriteController {

    private final IContinueWriteService continueWriteService;

   @PostMapping
    public ApiResponse<ContinueWriteResponse> continueWrite(
            @PathVariable("documentId") Long documentId,
            @RequestBody ContinueWriteRequest req) {
        return ApiResponse.succeed(
                continueWriteService.continueWrite(documentId, req.getContext(), req.getModelId(), req.getDocumentText()),
                "success");
    }
}
