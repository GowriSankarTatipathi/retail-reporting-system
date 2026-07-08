package com.gowrisankar.retailreporting.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.domain.entity.User;
import com.gowrisankar.retailreporting.dto.request.CategoryRequest;
import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.dto.response.CategoryResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import com.gowrisankar.retailreporting.exception.ErrorResponse;
import com.gowrisankar.retailreporting.repository.UserRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ProductControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private String managerToken;
    private String viewerToken;

    @BeforeEach
    void seedUsersAndAuthenticate() {
        userRepository.save(User.builder()
                .email("manager.it@retail-reporting.local")
                .passwordHash(passwordEncoder.encode("Password123"))
                .fullName("IT Manager")
                .role(Role.MANAGER)
                .enabled(true)
                .build());
        userRepository.save(User.builder()
                .email("viewer.it@retail-reporting.local")
                .passwordHash(passwordEncoder.encode("Password123"))
                .fullName("IT Viewer")
                .role(Role.VIEWER)
                .enabled(true)
                .build());

        managerToken = login("manager.it@retail-reporting.local");
        viewerToken = login("viewer.it@retail-reporting.local");
    }

    private String login(String email) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/v1/auth/login", new LoginRequest(email, "Password123"), AuthResponse.class);
        return response.getBody().accessToken();
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    @Test
    void managerCanCreateCategoryAndProductThenSearchFindsIt() {
        CategoryResponse category = restTemplate.exchange(
                "/api/v1/categories",
                HttpMethod.POST,
                new HttpEntity<>(new CategoryRequest("Test Category", "for integration tests"), authHeaders(managerToken)),
                CategoryResponse.class
        ).getBody();

        ProductRequest productRequest = new ProductRequest(
                "IT-TEST-1", "Integration Test Widget", "desc", category.id(),
                new BigDecimal("19.99"), new BigDecimal("9.99"), true, 50, 10, "WH-TEST");

        ResponseEntity<ProductResponse> createResponse = restTemplate.exchange(
                "/api/v1/products", HttpMethod.POST,
                new HttpEntity<>(productRequest, authHeaders(managerToken)), ProductResponse.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody().quantityOnHand()).isEqualTo(50);

        ResponseEntity<String> searchResponse = restTemplate.exchange(
                "/api/v1/products?q=IT-TEST-1", HttpMethod.GET,
                new HttpEntity<>(authHeaders(managerToken)), String.class);

        assertThat(searchResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(searchResponse.getBody()).contains("Integration Test Widget");
    }

    @Test
    void viewerCannotCreateProducts() {
        ProductRequest productRequest = new ProductRequest(
                "IT-TEST-2", "Should Fail", "desc", 1L,
                BigDecimal.TEN, BigDecimal.ONE, true, 10, 5, "WH-1");

        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
                "/api/v1/products", HttpMethod.POST,
                new HttpEntity<>(productRequest, authHeaders(viewerToken)), ErrorResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void creatingAProductWithADuplicateSkuIsRejected() {
        CategoryResponse category = restTemplate.exchange(
                "/api/v1/categories", HttpMethod.POST,
                new HttpEntity<>(new CategoryRequest("Dup SKU Category", null), authHeaders(managerToken)),
                CategoryResponse.class
        ).getBody();

        ProductRequest productRequest = new ProductRequest(
                "IT-DUP-1", "First", "desc", category.id(),
                BigDecimal.TEN, BigDecimal.ONE, true, 10, 5, "WH-1");
        restTemplate.exchange("/api/v1/products", HttpMethod.POST,
                new HttpEntity<>(productRequest, authHeaders(managerToken)), ProductResponse.class);

        ResponseEntity<ErrorResponse> secondResponse = restTemplate.exchange(
                "/api/v1/products", HttpMethod.POST,
                new HttpEntity<>(productRequest, authHeaders(managerToken)), ErrorResponse.class);

        assertThat(secondResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }
}
