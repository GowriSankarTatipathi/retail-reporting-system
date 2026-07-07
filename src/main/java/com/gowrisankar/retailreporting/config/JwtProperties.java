package com.gowrisankar.retailreporting.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds {@code app.jwt.*} properties (see application.yml). Values are sourced from
 * environment variables in every non-local environment - see .env.example and
 * docs/deployment.md. The application refuses to start with the placeholder secret
 * shipped in application.yml outside the {@code dev}/{@code test} profiles - see
 * {@code JwtService} constructor validation.
 */
@Component
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {

    /** Base64-encoded HMAC-SHA256 signing key, at least 256 bits. */
    private String secret;

    private long accessTokenTtlMinutes = 15;

    private long refreshTokenTtlDays = 7;
}
