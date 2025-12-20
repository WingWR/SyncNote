package com.syncnote.document.model;

import java.util.Set;

/**
 * 文档文件类型枚举和工具类
 * 统一管理支持的文件类型，便于后续扩展
 */
public class DocumentFileType {

    /**
     * 支持的文件类型集合
     */
    public static final Set<String> SUPPORTED_TYPES = Set.of(
            "txt",  // 文本文件
            "md",   // Markdown文件
            "docx", // Word文档
            "pptx"  // PowerPoint文档
    );

    /**
     * 默认文件类型
     */
    public static final String DEFAULT_TYPE = "txt";

    /**
     * 检查文件类型是否支持
     *
     * @param fileType 文件类型（小写）
     * @return 是否支持
     */
    public static boolean isSupported(String fileType) {
        if (fileType == null || fileType.isEmpty()) {
            return false;
        }
        return SUPPORTED_TYPES.contains(fileType.toLowerCase());
    }

    /**
     * 验证文件类型，如果不支持则抛出异常
     *
     * @param fileType 文件类型
     * @throws IllegalArgumentException 如果文件类型不支持
     */
    public static void validate(String fileType) {
        if (!isSupported(fileType)) {
            throw new IllegalArgumentException(
                    String.format("不支持的文件类型: %s，支持的类型: %s", 
                            fileType, String.join(", ", SUPPORTED_TYPES))
            );
        }
    }

    /**
     * 获取支持的文件类型正则表达式（用于验证注解）
     *
     * @return 正则表达式字符串，如 "txt|md"
     */
    public static String getSupportedTypesRegex() {
        return String.join("|", SUPPORTED_TYPES);
    }

    /**
     * 获取支持的文件类型描述信息
     *
     * @return 描述信息
     */
    public static String getSupportedTypesMessage() {
        return "文件类型只能是 " + String.join(" 或 ", SUPPORTED_TYPES);
    }

    /**
     * 用于验证注解的正则表达式（编译时常量，便于在注解中使用）
     * 注意：当添加新的文件类型时，需要同步更新此常量
     */
    public static final String REGEX_PATTERN = "txt|md";

    /**
     * 用于验证注解的错误消息（编译时常量，便于在注解中使用）
     * 注意：当添加新的文件类型时，需要同步更新此常量
     */
    public static final String VALIDATION_MESSAGE = "文件类型只能是 txt 或 md";
}

