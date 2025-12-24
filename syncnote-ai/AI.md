# AI Module Documentation

## Overview

The AI module provides integration with multiple Large Language Model (LLM) providers through LangChain4j, offering three main operation modes for document editing and question answering.

## Features

- **Multi-provider support**: Pluggable architecture supporting multiple AI providers (OpenAI, Azure OpenAI, custom HTTP endpoints, mock provider)
- **Three operation modes**:
  - **Continue (续写)**: Continue writing without altering prior content
  - **Polish (润色)**: Lightly polish existing content
  - **QA (问答)**: Answer questions without mutating the document
- **RESTful API**: Standard HTTP endpoints for model listing and chat operations
- **Configuration-driven**: Easy provider configuration through environment variables or application properties

## API Endpoints

### GET /api/ai/models

Returns a list of available AI models.

**Response:**
```json
{
  "models": [
    {
      "id": "gpt-3.5-turbo",
      "name": "gpt-3.5-turbo",
      "provider": "openai"
    },
    {
      "id": "mock-model",
      "name": "mock-model",
      "provider": "mock"
    }
  ]
}
```

### POST /api/ai/chat

Process an AI chat request.

**Request Body:**
```json
{
  "modelId": "gpt-3.5-turbo",
  "mode": "chat",
  "message": "What is this document about?",
  "context": "Document content here...",
  "documentId": "optional-doc-id"
}
```

**Supported modes:**
- `continue` or `rewrite-continue`: Continue writing
- `polish` or `rewrite-polish`: Polish content
- `chat`, `qa`, or `agent`: Question answering

**Response:**
```json
{
  "message": "AI response here...",
  "context": "Original context..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid model ID: unknown-model"
}
```

## Configuration

### Environment Variables

Configure AI providers using environment variables:

#### OpenAI Provider

```bash
# Enable/disable OpenAI provider
SYNCNOTE_AI_OPENAI_ENABLED=true

# OpenAI API key (required)
SYNCNOTE_AI_OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom endpoint (for Azure OpenAI or compatible services)
SYNCNOTE_AI_OPENAI_ENDPOINT=https://your-endpoint.com/v1

# Optional: Model ID (default: gpt-3.5-turbo)
SYNCNOTE_AI_OPENAI_MODEL_ID=gpt-4
```

#### Mock Provider (for Testing)

```bash
# Enable/disable mock provider (default: enabled)
SYNCNOTE_AI_MOCK_ENABLED=true

# Mock model ID (default: mock-model)
SYNCNOTE_AI_MOCK_MODEL_ID=test-model
```

### Application Properties

Alternatively, configure providers in `application.properties` or `application.yml`:

```properties
# OpenAI Provider
syncnote.ai.providers.openai.enabled=true
syncnote.ai.providers.openai.api-key=sk-your-api-key-here
syncnote.ai.providers.openai.endpoint=https://api.openai.com/v1
syncnote.ai.providers.openai.model-id=gpt-3.5-turbo

# Mock Provider
syncnote.ai.providers.mock.enabled=true
syncnote.ai.providers.mock.model-id=mock-model
```

### Development Profile

For development, use the `dev` profile which enables the mock provider by default:

```bash
java -jar syncnote-boot.jar --spring.profiles.active=dev
```

## Security

All endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer your-token-here
```

## Adding New Providers

To add a new AI provider:

1. Implement the `AiProvider` interface
2. Add configuration for the provider in `AiProperties`
3. Register the provider in `ProviderRegistry.initializeProviders()`

Example:

```java
public class CustomProvider implements AiProvider {
    
    public CustomProvider(AiProperties.ProviderConfig config) {
        // Initialize your provider
    }
    
    @Override
    public String rewriteContinue(String context, String prompt) {
        // Implementation
    }
    
    @Override
    public String rewritePolish(String context, String prompt) {
        // Implementation
    }
    
    @Override
    public String qa(String context, String message) {
        // Implementation
    }
    
    @Override
    public String getProviderId() {
        return "custom";
    }
    
    @Override
    public String getModelId() {
        return modelId;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

## Operation Modes Details

### Continue Mode (续写)

Continues writing based on existing context without modifying the prior content.

**Use cases:**
- Completing unfinished sentences or paragraphs
- Generating next sections of a document
- Extending existing content

**Example:**
```json
{
  "modelId": "gpt-3.5-turbo",
  "mode": "continue",
  "context": "The quick brown fox jumps over",
  "message": "Continue this sentence"
}
```

### Polish Mode (润色)

Lightly polishes and improves existing content while maintaining the original meaning and structure.

**Use cases:**
- Improving grammar and readability
- Enhancing word choice
- Refining sentence structure

**Example:**
```json
{
  "modelId": "gpt-3.5-turbo",
  "mode": "polish",
  "context": "The fox jump over the lazy dog quick",
  "message": "Improve grammar and flow"
}
```

### QA Mode (问答)

Answers questions based on optional context without modifying any document content.

**Use cases:**
- Getting explanations about document content
- Asking questions about specific topics
- Interactive chat without document modification

**Example:**
```json
{
  "modelId": "gpt-3.5-turbo",
  "mode": "chat",
  "context": "Document about project management...",
  "message": "What are the key principles mentioned?"
}
```

## Testing

Run tests with Maven:

```bash
cd server/syncnote-ai
mvn test
```

The mock provider is useful for testing without requiring actual API keys.

## Troubleshooting

### Provider not available

**Error:** `Invalid model ID: your-model-id`

**Solution:** Check that the provider is enabled and properly configured:
- Verify environment variables are set correctly
- Ensure API key is valid (for OpenAI)
- Check logs for provider initialization messages

### API key invalid

**Error:** Authentication errors from the provider

**Solution:** 
- Verify your API key is correct
- Check that the key has not expired
- Ensure the key has the necessary permissions

### No providers registered

**Error:** No models returned from `/api/ai/models`

**Solution:** 
- Enable at least one provider in configuration
- For testing, enable the mock provider: `SYNCNOTE_AI_MOCK_ENABLED=true`
- Check application logs for initialization errors

## Best Practices

1. **API Key Security**: Never commit API keys to version control. Use environment variables or secure secret management.

2. **Provider Selection**: Use the mock provider for development and testing, real providers for production.

3. **Error Handling**: Always handle potential errors when calling AI endpoints, as they may fail due to network issues or rate limits.

4. **Context Size**: Be mindful of context size limits for different models. Trim large documents if necessary.

5. **Rate Limiting**: Implement rate limiting on the frontend to avoid exceeding provider quotas.

## License

This module is part of the SyncNote project and follows the same license.
