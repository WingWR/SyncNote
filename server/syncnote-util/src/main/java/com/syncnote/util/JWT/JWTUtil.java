package com.syncnote.util.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JWTUtil {

    @Autowired
    private JwtProperties properties;

    // 生成 token
    public String generateToken(Long userId) {
        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + properties.getExpirationMs()))
                .signWith(Keys.hmacShaKeyFor(properties.getSecretKey().getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    // 解析 token
    public Long getUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(properties.getSecretKey().getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
        return Long.parseLong(claims.getSubject());
    }

    // 校验 token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(properties.getSecretKey().getBytes()))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
