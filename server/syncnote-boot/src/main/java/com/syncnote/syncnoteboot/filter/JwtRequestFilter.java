package com.syncnote.syncnoteboot.filter;

import com.syncnote.util.JWT.JWTUtil;
import com.syncnote.util.context.CurrentUserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 过滤器：从请求中提取 token，解析出 userId 并写入 CurrentUserContext
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
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
                    CurrentUserContext.setUserId(userId);
                } catch (Exception ignored) {
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            CurrentUserContext.clear();
        }
    }
}
