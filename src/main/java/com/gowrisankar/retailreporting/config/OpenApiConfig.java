package com.gowrisankar.retailreporting.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger metadata. Swagger UI is available at {@code /swagger-ui.html} and the
 * raw spec at {@code /v3/api-docs} (both public - see SecurityConfig). To try
 * authenticated endpoints in Swagger UI: call {@code POST /api/v1/auth/login}, then
 * click "Authorize" and paste the returned {@code accessToken}.
 */
@OpenAPIDefinition(
        info = @Info(
                title = "Retail Reporting System API",
                version = "v1",
                description = "REST API for retail product, inventory, customer, order, and reporting management.",
                contact = @Contact(name = "Gowri Sankar Reddy Tatipathi", email = "gowrisankart12@gmail.com"),
                license = @License(name = "MIT", url = "https://opensource.org/licenses/MIT")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Paste the access token returned by POST /api/v1/auth/login or /register"
)
@Configuration
public class OpenApiConfig {
}
