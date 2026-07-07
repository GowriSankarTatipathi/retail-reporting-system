package com.gowrisankar.retailreporting.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductRequest(

        @NotBlank(message = "SKU is required")
        @Size(max = 50, message = "SKU must be at most 50 characters")
        String sku,

        @NotBlank(message = "Product name is required")
        @Size(max = 200, message = "Product name must be at most 200 characters")
        String name,

        @Size(max = 4000, message = "Description must be at most 4000 characters")
        String description,

        @NotNull(message = "Category is required")
        Long categoryId,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", message = "Price must not be negative")
        BigDecimal price,

        @NotNull(message = "Cost price is required")
        @DecimalMin(value = "0.0", message = "Cost price must not be negative")
        BigDecimal costPrice,

        Boolean active,

        /** Initial stock quantity; used only when creating a new product. */
        @PositiveOrZero(message = "Initial quantity must not be negative")
        Integer initialQuantity,

        @PositiveOrZero(message = "Reorder level must not be negative")
        Integer reorderLevel,

        String warehouseLocation
) {
}
