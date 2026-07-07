package com.gowrisankar.retailreporting.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.request.InventoryAdjustRequest;
import com.gowrisankar.retailreporting.dto.request.ProductRequest;
import com.gowrisankar.retailreporting.dto.response.ProductResponse;
import com.gowrisankar.retailreporting.exception.DuplicateResourceException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.repository.CategoryRepository;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.repository.ProductRepository;
import com.gowrisankar.retailreporting.service.impl.ProductServiceImpl;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ProductServiceImplTest {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private InventoryRepository inventoryRepository;
    private InventoryService inventoryService;
    private ProductService productService;

    private Category category;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        inventoryRepository = mock(InventoryRepository.class);
        inventoryService = mock(InventoryService.class);

        productService = new ProductServiceImpl(productRepository, categoryRepository, inventoryRepository, inventoryService);

        category = Category.builder().id(1L).name("Electronics").description("").build();
    }

    @Test
    void createThrowsWhenSkuAlreadyExists() {
        ProductRequest request = new ProductRequest("ELEC-9999", "Test Product", "desc", 1L,
                BigDecimal.TEN, BigDecimal.ONE, true, 10, 5, "WH-1");

        when(productRepository.existsBySkuIgnoreCase("ELEC-9999")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("ELEC-9999");

        verify(productRepository, times(0)).save(any());
    }

    @Test
    void createThrowsWhenCategoryDoesNotExist() {
        ProductRequest request = new ProductRequest("ELEC-9999", "Test Product", "desc", 99L,
                BigDecimal.TEN, BigDecimal.ONE, true, 10, 5, "WH-1");

        when(productRepository.existsBySkuIgnoreCase("ELEC-9999")).thenReturn(false);
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createSucceedsAndCreatesPairedInventoryRecord() {
        ProductRequest request = new ProductRequest("ELEC-9999", "Test Product", "desc", 1L,
                new BigDecimal("29.99"), new BigDecimal("10.00"), true, 25, 5, "WH-1");

        Product savedProduct = Product.builder()
                .id(42L).sku("ELEC-9999").name("Test Product").description("desc")
                .category(category).price(new BigDecimal("29.99")).costPrice(new BigDecimal("10.00"))
                .active(true).build();
        Inventory savedInventory = Inventory.builder()
                .id(7L).product(savedProduct).quantityOnHand(25).reorderLevel(5).warehouseLocation("WH-1").build();

        when(productRepository.existsBySkuIgnoreCase("ELEC-9999")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
        when(inventoryService.createFor(any(Product.class), anyInt(), anyInt(), any())).thenReturn(savedInventory);

        ProductResponse response = productService.create(request);

        assertThat(response.sku()).isEqualTo("ELEC-9999");
        assertThat(response.quantityOnHand()).isEqualTo(25);
        assertThat(response.categoryName()).isEqualTo("Electronics");
        verify(inventoryService).createFor(savedProduct, 25, 5, "WH-1");
    }

    @Test
    void getByIdThrowsResourceNotFoundWhenMissing() {
        when(productRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(404L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deactivateSetsActiveFalseWithoutHardDeleting() {
        Product product = Product.builder()
                .id(5L).sku("SKU-5").name("Widget").category(category)
                .price(BigDecimal.ONE).costPrice(BigDecimal.ONE).active(true).build();

        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        productService.deactivate(5L);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }

    @Test
    void adjustInventoryDelegatesToInventoryServiceAfterExistenceCheck() {
        Product product = Product.builder().id(5L).sku("SKU-5").name("Widget").category(category)
                .price(BigDecimal.ONE).costPrice(BigDecimal.ONE).active(true).build();
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));

        InventoryAdjustRequest request = new InventoryAdjustRequest(-3, "damaged stock write-off");
        productService.adjustInventory(5L, request);

        verify(inventoryService).adjust(5L, -3, "damaged stock write-off");
    }
}
