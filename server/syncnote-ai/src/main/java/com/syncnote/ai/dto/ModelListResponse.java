package com.syncnote.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for model list endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelListResponse {
    private List<ModelInfo> models;
}