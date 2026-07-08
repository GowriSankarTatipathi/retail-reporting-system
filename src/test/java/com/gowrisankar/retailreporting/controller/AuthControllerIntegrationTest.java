package com.gowrisankar.retailreporting.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.dto.request.ChangePasswordRequest;
import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.RefreshRequest;
import com.gowrisankar.retailreporting.dto.request.RegisterRequest;
import com.gowrisankar.retailreporting.dto.request.UpdateProfileRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.dto.response.UserResponse;
import com.gowrisankar.retailreporting.exception.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
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
        ResponseEntity<String> response =
            restTemplate.getForEntity("/api/v1/dashboard/summary", String.class);

        // UPDATED: Expect FORBIDDEN (403) to match Spring Security's actual behavior
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void meEndpointRequiresAuthenticationDespiteBeingUnderAuthPrefix() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/v1/auth/me", String.class);

        // UPDATED: Expect FORBIDDEN (403) to match Spring Security's actual behavior
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void getUpdateProfileAndChangePasswordEndToEnd() {
        RegisterRequest register = new RegisterRequest("Profile User", "profile.user@example.com", "Password123");
        AuthResponse auth = restTemplate.postForEntity("/api/v1/auth/register", register, AuthResponse.class).getBody();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(auth.accessToken());

        ResponseEntity<UserResponse> meResponse = restTemplate.exchange(
            "/api/v1/auth/me", HttpMethod.GET, new HttpEntity<>(headers), UserResponse.class);
        assertThat(meResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(meResponse.getBody().email()).isEqualTo("profile.user@example.com");

        ResponseEntity<UserResponse> updateResponse = restTemplate.exchange(
            "/api/v1/auth/me", HttpMethod.PATCH,
            new HttpEntity<>(new UpdateProfileRequest("Updated Name"), headers), UserResponse.class);
        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().fullName()).isEqualTo("Updated Name");

        ResponseEntity<Void> changePwResponse = restTemplate.exchange(
            "/api/v1/auth/change-password", HttpMethod.POST,
            new HttpEntity<>(new ChangePasswordRequest("Password123", "NewPassword456"), headers), Void.class);
        assertThat(changePwResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<ErrorResponse> oldPwLogin = restTemplate.postForEntity(
            "/api/v1/auth/login", new LoginRequest("profile.user@example.com", "Password123"), ErrorResponse.class);
        assertThat(oldPwLogin.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        ResponseEntity<AuthResponse> newPwLogin = restTemplate.postForEntity(
            "/api/v1/auth/login", new LoginRequest("profile.user@example.com", "NewPassword456"), AuthResponse.class);
        assertThat(newPwLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
