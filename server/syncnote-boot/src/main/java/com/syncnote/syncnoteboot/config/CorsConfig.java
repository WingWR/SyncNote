package com.syncnote.syncnoteboot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许的域名，这里允许来自 localhost:5173 的请求
        config.addAllowedOriginPattern("*");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 允许的请求方法
        config.addAllowedMethod("*");
        
        // 允许携带凭证信息（如 Cookie）
        config.setAllowCredentials(true);
        
        // 允许预检请求缓存时间（秒）
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}