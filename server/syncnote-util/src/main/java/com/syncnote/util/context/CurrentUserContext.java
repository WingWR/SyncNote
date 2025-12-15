package com.syncnote.util.context;

/**
 * 线程级存放当前用户 id 的上下文，避免持久层直接依赖 Web 层
 */
public class CurrentUserContext {
    private static final ThreadLocal<Long> CONTEXT = new ThreadLocal<>();

    public static void setUserId(Long userId) {
        CONTEXT.set(userId);
    }

    public static Long getUserId() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
