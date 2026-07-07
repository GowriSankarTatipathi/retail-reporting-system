package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import java.util.List;

public interface InventoryService {

    Inventory createFor(Product product, Integer initialQuantity, Integer reorderLevel, String warehouseLocation);

    InventoryResponse getByProductId(Long productId);

    List<InventoryResponse> findLowStock();

    InventoryResponse adjust(Long productId, int delta, String reason);

    /** Locks and decrements stock; throws InsufficientStockException if not enough is available. */
    void reserveStock(Long productId, int quantity);

    /** Returns previously reserved stock to inventory (e.g. on order cancellation). */
    void releaseStock(Long productId, int quantity);
}
