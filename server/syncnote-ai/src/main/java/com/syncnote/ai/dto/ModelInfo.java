package com.syncnote.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model information DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelInfo {
    /**
     * 模型 ID（唯一）
     */
    private String id;

    /**
     * 模型显示名称
     */
    private String name;

    /**
     * 提供方 ID（如 openai/mock）
     */
    private String provider;
}