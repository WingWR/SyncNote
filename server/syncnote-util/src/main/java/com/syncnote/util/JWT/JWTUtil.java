package com.syncnote.util.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JWTUtil {

    @Autowired
    private JwtProperties properties;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 生成 token
    public String generateToken(Long userId) {
        String token = Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + properties.getExpirationMs()))
                .signWith(Keys.hmacShaKeyFor(properties.getSecretKey().getBytes()), SignatureAlgorithm.HS256)
                .compact();

        // 将Token存入Redis
        redisTemplate.opsForValue().set(properties.getRedisPrefix() + token, userId, properties.getExpirationMs(), TimeUnit.MILLISECONDS);

        return token;
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
        } catch (JwtException e) {
            return false;
        }

        // 检查 token 是否存在于 Redis
        String redisKey = properties.getRedisPrefix() + token;
        return redisTemplate.hasKey(redisKey);
    }

    // 让Token失效
    public void invalidateToken(String token) {
        redisTemplate.delete(properties.getRedisPrefix() + token);
    }
}
