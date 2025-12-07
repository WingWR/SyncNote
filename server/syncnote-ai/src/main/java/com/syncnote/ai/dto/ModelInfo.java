package com.syncnote.ai.dto;

/**
 * Model information DTO
 */
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}