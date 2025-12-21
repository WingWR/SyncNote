package com.syncnote.syncnoteboot.filter;

import com.syncnote.util.JWT.JWTUtil;
import com.syncnote.util.context.CurrentUserContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 过滤器：从请求中提取 token，解析出 userId 并写入 CurrentUserContext
 */
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    public JwtRequestFilter(JWTUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String path = request.getRequestURI();
            // 如果是 WebSocket 握手路径，直接放行，不要走 JWT 校验
            if (path.startsWith("/ws/")) {
                filterChain.doFilter(request, response);
                return;
            }

            String authHeader = request.getHeader("Authorization");
            String token = null;
            if (authHeader != null && authHeader.toLowerCase().startsWith("bearer")) {
                token = authHeader.replaceFirst("(?i)Bearer", "").trim();
            }
            if ((token == null || token.isEmpty())) token = request.getHeader("token");
            if ((token == null || token.isEmpty())) token = request.getParameter("token");

            if (token != null && !token.isEmpty()) {
                try {
                    Long userId = jwtUtil.getUserId(token);
                    if (userId != null) {
                        // 写入当前线程上下文，供业务使用
                        CurrentUserContext.setUserId(userId);

                        // 同时设置 Spring Security Authentication，避免 Security 返回 403
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userId, null, java.util.Collections.emptyList());
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        logger.debug("JWT authentication succeeded for userId={}", userId);
                    }
                } catch (Exception ex) {
                    // 记录失败原因，便于排查 token 解析或签名问题
                    logger.debug("Failed to parse/validate JWT token: {}", ex.getMessage());
                }
            } else {
                logger.trace("No JWT token found in request headers/params");
            }

            filterChain.doFilter(request, response);
        } finally {
            CurrentUserContext.clear();
        }
    }
}
