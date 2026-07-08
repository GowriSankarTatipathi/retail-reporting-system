package com.gowrisankar.retailreporting.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.domain.entity.Role;
import com.gowrisankar.retailreporting.domain.entity.User;
import com.gowrisankar.retailreporting.dto.request.CategoryRequest;
import com.gowrisankar.retailreporting.dto.request.CustomerRequest;
import com.gowrisankar.retailreporting.dto.request.LoginRequest;
import com.gowrisankar.retailreporting.dto.request.OrderItemRequest;
import com.gowrisankar.retailreporting.dto.request.OrderRequest;
import com.gowrisankar.retailreporting.dto.request.OrderStatusUpdateRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.AuthResponse;
import com.gowrisankar.retailreporting.dto.response.CategoryResponse;
import com.gowrisankar.retailreporting.dto.response.CustomerResponse;
import com.gowrisankar.retailreporting.dto.response.OrderResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import com.gowrisankar.retailreporting.exception.ErrorResponse;
import com.gowrisankar.retailreporting.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
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
// UPDATED: Wipe the database after every single test method to prevent Unique Index collisions in @BeforeEach
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class OrderControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private String managerToken;

    @BeforeEach
    void seedManagerAndAuthenticate() {
        userRepository.save(User.builder()
            .email("order.manager@retail-reporting.local")
            .passwordHash(passwordEncoder.encode("Password123"))
            .fullName("Order Manager")
            .role(Role.MANAGER)
            .enabled(true)
            .build());

        ResponseEntity<AuthResponse> loginResponse = restTemplate.postForEntity(
            "/api/v1/auth/login",
            new LoginRequest("order.manager@retail-reporting.local", "Password123"),
            AuthResponse.class);
        managerToken = loginResponse.getBody().accessToken();
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(managerToken);
        return headers;
    }

    private CategoryResponse createCategory(String name) {
        return restTemplate.exchange("/api/v1/categories", HttpMethod.POST,
            new HttpEntity<>(new CategoryRequest(name, null), authHeaders()), CategoryResponse.class).getBody();
    }

    private ProductResponse createProduct(String sku, Long categoryId, int quantity) {
        ProductRequest request = new ProductRequest(sku, "Product " + sku, "desc", categoryId,
            new BigDecimal("25.00"), new BigDecimal("10.00"), true, quantity, 5, "WH-1");
        return restTemplate.exchange("/api/v1/products", HttpMethod.POST,
            new HttpEntity<>(request, authHeaders()), ProductResponse.class).getBody();
    }

    private CustomerResponse createCustomer(String email) {
        CustomerRequest request = new CustomerRequest("Test", "Customer", email, null, null, null, null, null);
        return restTemplate.exchange("/api/v1/customers", HttpMethod.POST,
            new HttpEntity<>(request, authHeaders()), CustomerResponse.class).getBody();
    }

    @Test
    void placingAnOrderDecrementsStockAndComputesTotalServerSide() {
        CategoryResponse category = createCategory("Order Test Category");
        ProductResponse product = createProduct("ORD-TEST-1", category.id(), 20);
        CustomerResponse customer = createCustomer("order.customer1@example.com");

        OrderRequest orderRequest = new OrderRequest(customer.id(), List.of(new OrderItemRequest(product.id(), 4)));
        ResponseEntity<OrderResponse> orderResponse = restTemplate.exchange(
            "/api/v1/orders", HttpMethod.POST, new HttpEntity<>(orderRequest, authHeaders()), OrderResponse.class);

        assertThat(orderResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(orderResponse.getBody().totalAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(orderResponse.getBody().status()).isEqualTo(OrderStatus.PENDING);

        ResponseEntity<ProductResponse> productAfter = restTemplate.exchange(
            "/api/v1/products/" + product.id(), HttpMethod.GET,
            new HttpEntity<>(authHeaders()), ProductResponse.class);
        assertThat(productAfter.getBody().quantityOnHand()).isEqualTo(16);
    }

    @Test
    void placingAnOrderThatExceedsStockIsRejectedWithConflict() {
        CategoryResponse category = createCategory("Order Test Category 2");
        ProductResponse product = createProduct("ORD-TEST-2", category.id(), 2);
        CustomerResponse customer = createCustomer("order.customer2@example.com");

        OrderRequest orderRequest = new OrderRequest(customer.id(), List.of(new OrderItemRequest(product.id(), 999)));
        ResponseEntity<ErrorResponse> response = restTemplate.exchange(
            "/api/v1/orders", HttpMethod.POST, new HttpEntity<>(orderRequest, authHeaders()), ErrorResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void cancellingAnOrderReleasesStockBackToInventory() {
        CategoryResponse category = createCategory("Order Test Category 3");
        ProductResponse product = createProduct("ORD-TEST-3", category.id(), 10);
        CustomerResponse customer = createCustomer("order.customer3@example.com");

        OrderResponse order = restTemplate.exchange("/api/v1/orders", HttpMethod.POST,
            new HttpEntity<>(new OrderRequest(customer.id(), List.of(new OrderItemRequest(product.id(), 5))), authHeaders()),
            OrderResponse.class).getBody();

        ResponseEntity<OrderResponse> cancelResponse = restTemplate.exchange(
            "/api/v1/orders/" + order.id() + "/status", HttpMethod.PATCH,
            new HttpEntity<>(new OrderStatusUpdateRequest(OrderStatus.CANCELLED), authHeaders()), OrderResponse.class);

        assertThat(cancelResponse.getBody().status()).isEqualTo(OrderStatus.CANCELLED);

        ResponseEntity<ProductResponse> productAfter = restTemplate.exchange(
            "/api/v1/products/" + product.id(), HttpMethod.GET,
            new HttpEntity<>(authHeaders()), ProductResponse.class);
        assertThat(productAfter.getBody().quantityOnHand()).isEqualTo(10); // fully released
    }
}
