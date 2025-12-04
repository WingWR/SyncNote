package com.syncnote.syncnoteboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.syncnote")
public class SyncnoteBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(SyncnoteBootApplication.class, args);
    }
}
