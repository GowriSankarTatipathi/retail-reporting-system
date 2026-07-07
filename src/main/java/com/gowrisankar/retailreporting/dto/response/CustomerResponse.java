package com.gowrisankar.retailreporting.dto.response;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        String city,
        String state,
        String zipCode,
        LocalDateTime createdAt
) {
}
