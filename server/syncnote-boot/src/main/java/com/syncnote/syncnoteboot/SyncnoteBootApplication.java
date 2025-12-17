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
}
