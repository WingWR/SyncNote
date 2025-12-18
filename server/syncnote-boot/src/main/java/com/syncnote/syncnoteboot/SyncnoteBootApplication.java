package com.syncnote.syncnoteboot;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan({"com.syncnote.user.mapper",
        "com.syncnote.document.mapper"})
@SpringBootApplication(scanBasePackages = "com.syncnote")
public class SyncnoteBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(SyncnoteBootApplication.class, args);
    }

    /**
     * 全局 Jackson 配置：将 Long 类型序列化为 String
     * 解决前端 JavaScript 大整数精度丢失问题
     */
    @org.springframework.context.annotation.Bean
    public org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.serializerByType(Long.class, com.fasterxml.jackson.databind.ser.std.ToStringSerializer.instance);
            builder.serializerByType(Long.TYPE, com.fasterxml.jackson.databind.ser.std.ToStringSerializer.instance);
        };
    }
}
