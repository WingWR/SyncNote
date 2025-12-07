# SyncNote
同济大学 计算机科学与技术学院 软件工程 JAVA企业级应用开发 2025年秋(软数方向必修课)

## Modules

- **syncnote-ai**: AI operation module with LangChain4j integration. See [AI.md](server/syncnote-ai/AI.md) for details.
- **syncnote-user**: User management module
- **syncnote-document**: Document management module
- **syncnote-boot**: Main application boot module

## AI Module

The AI module provides integration with multiple LLM providers for document editing operations:

- **Continue (续写)**: Continue writing without altering prior content
- **Polish (润色)**: Lightly polish existing content
- **QA (问答)**: Answer questions without mutating the document

For configuration and usage details, see [server/syncnote-ai/AI.md](server/syncnote-ai/AI.md).
