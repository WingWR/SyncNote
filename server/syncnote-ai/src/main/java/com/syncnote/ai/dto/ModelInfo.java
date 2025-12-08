package com.syncnote.ai.dto;
import lombok.Data;
/**
 * Model information DTO
 */
@Data
public class ModelInfo {
    
    private String id;
    private String name;
    private String provider;

    public ModelInfo() {
    }

    public ModelInfo(String id, String name, String provider) {
        this.id = id;
        this.name = name;
        this.provider = provider;
    }

}