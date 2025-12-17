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

    private final Map<String, IAIProvider> providersByModel;

    public ProviderRegistry(List<IAIProvider> providers) {
        this.providersByModel = providers.stream()
                .filter(IAIProvider::isEnabled)
                .collect(Collectors.toMap(IAIProvider::getModelId, p -> p, (a, b) -> a));
        logger.info("Initialized {} AI provider(s)", providersByModel.size());
    }

    public Optional<IAIProvider> getProvider(String modelId) {
        return Optional.ofNullable(providersByModel.get(modelId));
    }

    public Map<String, IAIProvider> getAllProviders() {
        return providersByModel;
    }

    public boolean hasProvider(String modelId) {
        return providersByModel.containsKey(modelId);
    }
}