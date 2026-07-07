package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.request.InventoryAdjustRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import com.gowrisankar.retailreporting.dto.response.PageResponse;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import com.gowrisankar.retailreporting.exception.DuplicateResourceException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.mapper.ProductMapper;
import com.gowrisankar.retailreporting.repository.CategoryRepository;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.repository.ProductRepository;
import com.gowrisankar.retailreporting.repository.specification.ProductSpecifications;
import com.gowrisankar.retailreporting.service.InventoryService;
import com.gowrisankar.retailreporting.service.ProductService;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    public ProductServiceImpl(ProductRepository productRepository,
                               CategoryRepository categoryRepository,
                               InventoryRepository inventoryRepository,
                               InventoryService inventoryService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(Long categoryId, Boolean active, BigDecimal minPrice,
                                                 BigDecimal maxPrice, String q, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecifications.hasCategoryId(categoryId))
                .and(ProductSpecifications.isActive(active))
                .and(ProductSpecifications.priceBetween(minPrice, maxPrice))
                .and(ProductSpecifications.search(q));

        Page<Product> page = productRepository.findAll(spec, pageable);
        Page<ProductResponse> mapped = page.map(this::toResponseWithInventory);
        return PageResponse.from(mapped);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponseWithInventory(findOrThrow(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.sku())) {
            throw new DuplicateResourceException("A product with SKU '" + request.sku() + "' already exists");
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", request.categoryId()));

        Product product = Product.builder()
                .sku(request.sku())
                .name(request.name())
                .description(request.description())
                .category(category)
                .price(request.price())
                .costPrice(request.costPrice())
                .active(request.active() == null || request.active())
                .build();
        Product saved = productRepository.save(product);

        Inventory inventory = inventoryService.createFor(
                saved, request.initialQuantity(), request.reorderLevel(), request.warehouseLocation());

        log.info("Product created: id={}, sku={}", saved.getId(), saved.getSku());
        return ProductMapper.toResponse(saved, inventory);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findOrThrow(id);

        if (!product.getSku().equalsIgnoreCase(request.sku()) && productRepository.existsBySkuIgnoreCase(request.sku())) {
            throw new DuplicateResourceException("A product with SKU '" + request.sku() + "' already exists");
        }
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", request.categoryId()));

        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(category);
        product.setPrice(request.price());
        product.setCostPrice(request.costPrice());
        if (request.active() != null) {
            product.setActive(request.active());
        }
        Product saved = productRepository.save(product);
        log.info("Product updated: id={}", saved.getId());
        return toResponseWithInventory(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public void deactivate(Long id) {
        Product product = findOrThrow(id);
        product.setActive(false); // soft delete only - see docs/database.md
        productRepository.save(product);
        log.info("Product deactivated: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getInventory(Long productId) {
        Product product = findOrThrow(productId);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));
        return ProductMapper.toInventoryResponse(product, inventory);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public InventoryResponse adjustInventory(Long productId, InventoryAdjustRequest request) {
        findOrThrow(productId); // 404s early if the product doesn't exist
        return inventoryService.adjust(productId, request.quantityDelta(), request.reason());
    }

    private ProductResponse toResponseWithInventory(Product product) {
        Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
        return ProductMapper.toResponse(product, inventory);
    }

    private Product findOrThrow(Long id) {
        return productRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Product", id));
    }
}
