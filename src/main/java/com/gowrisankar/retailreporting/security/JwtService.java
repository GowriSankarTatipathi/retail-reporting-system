package com.gowrisankar.retailreporting.security;

import com.gowrisankar.retailreporting.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Issues and validates JWT access/refresh tokens (stateless auth - see
 * docs/architecture.md Decision Log). Tokens are HMAC-SHA256 signed.
 * <p>
 * Note: refresh tokens are not persisted/revocable in this iteration - see ROADMAP.md
 * for the planned Redis-backed denylist for immediate revocation on logout.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String CLAIM_TOKEN_TYPE = "type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";
    private static final String CLAIM_ROLE = "role";

    private final JwtProperties properties;
    private SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        if (properties.getSecret() == null || properties.getSecret().isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret must be configured (see .env.example: JWT_SECRET). Refusing to start.");
        }
        byte[] keyBytes = Decoders.BASE64.decode(properties.getSecret());
        if (keyBytes.length < 32) {
            log.warn("JWT signing key is shorter than the recommended 256 bits ({} bytes). "
                    + "Generate a stronger secret with: openssl rand -base64 64", keyBytes.length);
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UserDetails userDetails) {
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_VIEWER");
        return buildToken(userDetails.getUsername(),
                Map.of(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS, CLAIM_ROLE, role),
                ChronoUnit.MINUTES, properties.getAccessTokenTtlMinutes());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails.getUsername(),
                Map.of(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH),
                ChronoUnit.DAYS, properties.getRefreshTokenTtlDays());
    }

    public long getAccessTokenTtlSeconds() {
        return properties.getAccessTokenTtlMinutes() * 60;
    }

    private String buildToken(String subject, Map<String, Object> claims, ChronoUnit unit, long amount) {
        Instant now = Instant.now();
        Instant expiry = now.plus(amount, unit);
        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        return TOKEN_TYPE_REFRESH.equals(parseClaims(token).get(CLAIM_TOKEN_TYPE, String.class));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(userDetails.getUsername()) && !isExpired(claims);
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Rejected invalid JWT: {}", ex.getMessage());
            return false;
        }
    }

    private boolean isExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            // Expired tokens still carry valid, verifiable claims - callers that only
            // need the subject (e.g. logout) can use them; callers that check validity
            // will see isTokenValid() return false via the expiration check.
            return ex.getClaims();
        }
    }
}
