package com.gowrisankar.retailreporting.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OrderRequest(

        @NotNull(message = "Customer id is required")
        Long customerId,

        @NotEmpty(message = "An order must contain at least one line item")
        @Valid
        List<OrderItemRequest> items
) {
}
