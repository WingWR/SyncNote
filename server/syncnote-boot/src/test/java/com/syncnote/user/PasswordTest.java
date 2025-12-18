package com.syncnote.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest(classes = com.syncnote.syncnoteboot.SyncnoteBootApplication.class)
public class PasswordTest {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void generatePasswordHash() {
        String rawPassword = "Software007@";
        String hashed = passwordEncoder.encode(rawPassword);
        System.out.println("✅ BCrypt Hash for '" + rawPassword + "':");
        System.out.println(hashed);
    }
}
