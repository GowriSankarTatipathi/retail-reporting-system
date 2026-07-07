package com.gowrisankar.retailreporting.controller;

import com.gowrisankar.retailreporting.dto.request.InventoryAdjustRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import com.gowrisankar.retailreporting.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product catalog and per-product inventory")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Search products",
            description = "Supports pagination, sorting, category/active/price filters, and free-text search on name/SKU")
    public ResponseEntity<PageResponse<ProductResponse>> search(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @Parameter(description = "Free-text search on name or SKU") String q,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(productService.search(categoryId, active, minPrice, maxPrice, q, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a product by id")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a product (ADMIN, MANAGER)")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product (ADMIN, MANAGER)")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a product (soft delete; ADMIN, MANAGER)")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        productService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/inventory")
    @Operation(summary = "Get current stock level for a product")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getInventory(id));
    }

    @PatchMapping("/{id}/inventory")
    @Operation(summary = "Manually adjust stock (restock or write-off; ADMIN, MANAGER)")
    public ResponseEntity<InventoryResponse> adjustInventory(@PathVariable Long id,
                                                              @Valid @RequestBody InventoryAdjustRequest request) {
        return ResponseEntity.ok(productService.adjustInventory(id, request));
    }
}
