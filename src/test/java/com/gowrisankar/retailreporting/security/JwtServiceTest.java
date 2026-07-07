package com.gowrisankar.retailreporting.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.config.JwtProperties;
import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        // 64+ char base64-decodable string -> well over the 256-bit minimum key size.
        properties.setSecret("dGVzdC1vbmx5LXNlY3JldC1rZXktZm9yLWp1bml0LXRlc3RzLW5vdC1mb3ItcHJvZHVjdGlvbi11c2U=");
        properties.setAccessTokenTtlMinutes(15);
        properties.setRefreshTokenTtlDays(7);

        jwtService = new JwtService(properties);
        jwtService.init(); // @PostConstruct does not run outside a Spring context

        User user = User.builder()
                .id(1L)
                .email("analyst@retail-reporting.local")
                .passwordHash("irrelevant-for-this-test")
                .fullName("Data Analyst")
                .role(Role.ANALYST)
                .enabled(true)
                .build();
        userDetails = new SecurityUser(user);
    }

    @Test
    void generatesAndValidatesAnAccessToken() {
        String token = jwtService.generateAccessToken(userDetails);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("analyst@retail-reporting.local");
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isFalse();
    }

    @Test
    void generatesAndValidatesARefreshToken() {
        String token = jwtService.generateRefreshToken(userDetails);

        assertThat(jwtService.isRefreshToken(token)).isTrue();
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    void rejectsATokenIssuedForADifferentUser() {
        String token = jwtService.generateAccessToken(userDetails);

        User otherUser = User.builder()
                .id(2L)
                .email("someone-else@retail-reporting.local")
                .passwordHash("irrelevant")
                .fullName("Someone Else")
                .role(Role.VIEWER)
                .enabled(true)
                .build();
        UserDetails otherUserDetails = new SecurityUser(otherUser);

        assertThat(jwtService.isTokenValid(token, otherUserDetails)).isFalse();
    }

    @Test
    void rejectsAMalformedToken() {
        assertThat(jwtService.isTokenValid("not-a-real-jwt", userDetails)).isFalse();
    }
}
