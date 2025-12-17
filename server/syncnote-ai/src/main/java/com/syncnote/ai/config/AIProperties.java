package com.syncnote.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Data
@Component
@ConfigurationProperties(prefix = "syncnote.ai")
public class AIProperties {

    private Map<String, ProviderConfig> providers = new HashMap<>();

    @Data
    public static class ProviderConfig {
        private boolean enabled = false;
        private String apiKey;
        private String endpoint;
        private String modelId;
        private Map<String, String> parameters = new HashMap<>();
    }
}