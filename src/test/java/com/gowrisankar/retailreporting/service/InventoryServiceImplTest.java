package com.gowrisankar.retailreporting.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gowrisankar.retailreporting.domain.entity.Category;
import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.exception.InsufficientStockException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.service.impl.InventoryServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InventoryServiceImplTest {

    private InventoryRepository inventoryRepository;
    private InventoryService inventoryService;
    private Product product;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        inventoryRepository = mock(InventoryRepository.class);
        inventoryService = new InventoryServiceImpl(inventoryRepository);

        Category category = Category.builder().id(1L).name("Electronics").build();
        product = Product.builder().id(10L).sku("SKU-10").name("Widget").category(category).build();
        inventory = Inventory.builder().id(1L).product(product).quantityOnHand(20).reorderLevel(5).build();

        when(inventoryRepository.save(org.mockito.ArgumentMatchers.any(Inventory.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void reserveStockDecrementsQuantityWhenSufficient() {
        when(inventoryRepository.findByProductIdForUpdate(10L)).thenReturn(Optional.of(inventory));

        inventoryService.reserveStock(10L, 5);

        assertThat(inventory.getQuantityOnHand()).isEqualTo(15);
        verify(inventoryRepository).save(inventory);
    }

    @Test
    void reserveStockThrowsWhenInsufficient() {
        when(inventoryRepository.findByProductIdForUpdate(10L)).thenReturn(Optional.of(inventory));

        assertThatThrownBy(() -> inventoryService.reserveStock(10L, 999))
                .isInstanceOf(InsufficientStockException.class);

        // Quantity must be unchanged - the failed reservation must not partially apply.
        assertThat(inventory.getQuantityOnHand()).isEqualTo(20);
    }

    @Test
    void reserveStockThrowsResourceNotFoundWhenNoInventoryRecord() {
        when(inventoryRepository.findByProductIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.reserveStock(999L, 1))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void releaseStockIncrementsQuantity() {
        when(inventoryRepository.findByProductIdForUpdate(10L)).thenReturn(Optional.of(inventory));

        inventoryService.releaseStock(10L, 3);

        assertThat(inventory.getQuantityOnHand()).isEqualTo(23);
    }

    @Test
    void adjustRejectsDeltaThatWouldGoNegative() {
        when(inventoryRepository.findByProductIdForUpdate(10L)).thenReturn(Optional.of(inventory));

        assertThatThrownBy(() -> inventoryService.adjust(10L, -100, "damaged"))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void adjustAppliesPositiveDelta() {
        when(inventoryRepository.findByProductIdForUpdate(10L)).thenReturn(Optional.of(inventory));

        inventoryService.adjust(10L, 10, "restock");

        assertThat(inventory.getQuantityOnHand()).isEqualTo(30);
    }
}
