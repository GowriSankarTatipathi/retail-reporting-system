package com.gowrisankar.retailreporting.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.RefreshRequest;
import com.gowrisankar.retailreporting.dto.request.RegisterRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.exception.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerThenLoginThenRefreshEndToEnd() {
        RegisterRequest register = new RegisterRequest("Jane Doe", "jane.doe@example.com", "Password123");
        ResponseEntity<AuthResponse> registerResponse =
                restTemplate.postForEntity("/api/v1/auth/register", register, AuthResponse.class);

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(registerResponse.getBody()).isNotNull();
        assertThat(registerResponse.getBody().user().role().name()).isEqualTo("VIEWER");
        assertThat(registerResponse.getBody().accessToken()).isNotBlank();

        LoginRequest login = new LoginRequest("jane.doe@example.com", "Password123");
        ResponseEntity<AuthResponse> loginResponse =
                restTemplate.postForEntity("/api/v1/auth/login", login, AuthResponse.class);

        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String refreshToken = loginResponse.getBody().refreshToken();

        ResponseEntity<AuthResponse> refreshResponse =
                restTemplate.postForEntity("/api/v1/auth/refresh", new RefreshRequest(refreshToken), AuthResponse.class);

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshResponse.getBody().accessToken()).isNotBlank();
    }

    @Test
    void registeringTheSameEmailTwiceIsRejected() {
        RegisterRequest register = new RegisterRequest("Dup User", "dup@example.com", "Password123");
        restTemplate.postForEntity("/api/v1/auth/register", register, AuthResponse.class);

        ResponseEntity<ErrorResponse> second =
                restTemplate.postForEntity("/api/v1/auth/register", register, ErrorResponse.class);

        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void loginWithWrongPasswordReturns401() {
        RegisterRequest register = new RegisterRequest("Wrong Pw", "wrongpw@example.com", "Password123");
        restTemplate.postForEntity("/api/v1/auth/register", register, AuthResponse.class);

        LoginRequest badLogin = new LoginRequest("wrongpw@example.com", "TotallyWrongPassword1");
        ResponseEntity<ErrorResponse> response =
                restTemplate.postForEntity("/api/v1/auth/login", badLogin, ErrorResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void accessingAProtectedEndpointWithoutATokenIsRejected() {
        // Body shape isn't asserted here: an outright missing-credentials 401 is produced
        // by Spring Security's entry point before the request ever reaches a controller,
        // so it does not go through GlobalExceptionHandler's ErrorResponse contract.
        ResponseEntity<String> response =
                restTemplate.getForEntity("/api/v1/dashboard/summary", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
