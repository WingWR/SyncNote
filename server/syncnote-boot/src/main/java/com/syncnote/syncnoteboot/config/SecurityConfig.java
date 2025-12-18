package com.syncnote.syncnoteboot.config;

import com.syncnote.syncnoteboot.filter.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;



import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    /**
     * 配置加密方式：与 AuthServiceImpl 中的 passwordEncoder 对应
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Avoid constructor injection of JwtRequestFilter to prevent circular bean creation.

    @Bean
    public JwtRequestFilter jwtRequestFilterBean(com.syncnote.util.JWT.JWTUtil jwtUtil) {
        return new com.syncnote.syncnoteboot.filter.JwtRequestFilter(jwtUtil);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, com.syncnote.syncnoteboot.filter.JwtRequestFilter jwtRequestFilter) throws Exception {
        http
            // 1. 禁用 CSRF
            .csrf(csrf -> csrf.disable())

            // 2. 配置跨域 (CORS)
            .cors(Customizer.withDefaults())

            // 3. 设置 Session 管理为"无状态"
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 4. 配置接口放行规则
            .authorizeHttpRequests(auth -> auth
                // 修正API路径：根据项目实际使用 /api/auth/** 路径
                .requestMatchers("/api/auth/**").permitAll()
                // 放行Actuator端点
                .requestMatchers("/actuator/**").permitAll()
                // 剩下的所有请求都需要经过认证
                .anyRequest().authenticated()
            )

            // 5. 禁用默认的表单登录和 HTTP Basic 认证
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // 6. 配置异常处理
            .exceptionHandling(exception -> exception
                .accessDeniedHandler(new com.syncnote.syncnoteboot.config.LoggingAccessDeniedHandler())
                .authenticationEntryPoint(new com.syncnote.syncnoteboot.config.LoggingAuthenticationEntryPoint())
            )
        ;

                






        // 将自定义 JWT 过滤器加入到 Spring Security 的过滤链，确保在授权决策前完成认证
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        // 注册自定义的 AccessDeniedHandler 与 AuthenticationEntryPoint，记录拒绝/认证失败的详细信息
        AccessDeniedHandler accessDeniedHandler = new com.syncnote.syncnoteboot.config.LoggingAccessDeniedHandler();
        AuthenticationEntryPoint authenticationEntryPoint = new com.syncnote.syncnoteboot.config.LoggingAuthenticationEntryPoint();
        http.exceptionHandling(handling -> handling.accessDeniedHandler(accessDeniedHandler).authenticationEntryPoint(authenticationEntryPoint));

        return http.build();
    }



    /**
     * 跨域资源共享配置
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 允许前端的地址 - 符合"开发环境CORS配置"记忆要求
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // 允许的请求方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 允许的请求头
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // 允许携带凭证 - 符合"开发环境CORS配置"记忆要求
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}