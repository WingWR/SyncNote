package com.syncnote.ai.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ProviderRegistry {

    private static final Logger logger = LoggerFactory.getLogger(ProviderRegistry.class);

    private final Map<String, AIProvider> providersByModel;

    public ProviderRegistry(List<AIProvider> providers) {
        this.providersByModel = providers.stream()
                .filter(AIProvider::isEnabled)
                .collect(Collectors.toMap(AIProvider::getModelId, p -> p, (a, b) -> a));
        logger.info("Initialized {} AI provider(s)", providersByModel.size());
    }

    public Optional<AIProvider> getProvider(String modelId) {
        return Optional.ofNullable(providersByModel.get(modelId));
    }

    public Map<String, AIProvider> getAllProviders() {
        return providersByModel;
    }

    public boolean hasProvider(String modelId) {
        return providersByModel.containsKey(modelId);
    }
}