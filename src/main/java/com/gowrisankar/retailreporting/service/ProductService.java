package com.gowrisankar.retailreporting.service;

import com.gowrisankar.retailreporting.dto.request.InventoryAdjustRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    PageResponse<ProductResponse> search(Long categoryId, Boolean active, BigDecimal minPrice,
                                          BigDecimal maxPrice, String q, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void deactivate(Long id);

    InventoryResponse getInventory(Long productId);

    InventoryResponse adjustInventory(Long productId, InventoryAdjustRequest request);
}
