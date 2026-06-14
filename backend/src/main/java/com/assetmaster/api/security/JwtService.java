package com.assetmaster.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-expiry-sec}")
    private long accessExpirySec;

    @Value("${app.jwt.refresh-expiry-sec}")
    private long refreshExpirySec;

    private static final String CLAIM_2FA_PENDING = "2fa_pending";
    private static final long   PARTIAL_TOKEN_MS  = 5 * 60 * 1000L; // 5 min

    public String generateAccessToken(UserDetails user) {
        return buildToken(user.getUsername(), accessExpirySec * 1000L, false);
    }

    public String generateRefreshToken(UserDetails user) {
        return buildToken(user.getUsername(), refreshExpirySec * 1000L, false);
    }

    /** Short-lived token used only during the 2FA verification step. */
    public String generatePartialToken(UserDetails user) {
        return buildToken(user.getUsername(), PARTIAL_TOKEN_MS, true);
    }

    public boolean isPartialToken(String token) {
        try {
            return Boolean.TRUE.equals(parseClaims(token).get(CLAIM_2FA_PENDING, Boolean.class));
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails user) {
        try {
            String username = extractUsername(token);
            return username.equals(user.getUsername()) && !isExpired(token) && !isPartialToken(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String buildToken(String subject, long expiryMs, boolean partial) {
        long now = System.currentTimeMillis();
        var builder = Jwts.builder()
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expiryMs));
        if (partial) builder.claim(CLAIM_2FA_PENDING, true);
        return builder.signWith(signingKey()).compact();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
