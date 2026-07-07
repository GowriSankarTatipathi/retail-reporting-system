package com.gowrisankar.retailreporting.mapper;

import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;

public final class ProductMapper {

    private ProductMapper() {
    }

    public static ProductResponse toResponse(Product product, Inventory inventory) {
        Integer qty = inventory != null ? inventory.getQuantityOnHand() : null;
        Integer reorder = inventory != null ? inventory.getReorderLevel() : null;
        boolean lowStock = inventory != null && inventory.isLowStock();
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getCostPrice(),
                product.isActive(),
                qty,
                reorder,
                lowStock,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public static InventoryResponse toInventoryResponse(Product product, Inventory inventory) {
        return new InventoryResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                inventory.getQuantityOnHand(),
                inventory.getReorderLevel(),
                inventory.getWarehouseLocation(),
                inventory.isLowStock(),
                inventory.getUpdatedAt()
        );
    }
}
