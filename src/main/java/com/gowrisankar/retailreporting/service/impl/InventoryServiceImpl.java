package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.domain.entity.Product;
import com.gowrisankar.retailreporting.dto.response.InventoryResponse;
import com.gowrisankar.retailreporting.exception.InsufficientStockException;
import com.gowrisankar.retailreporting.exception.ResourceNotFoundException;
import com.gowrisankar.retailreporting.mapper.ProductMapper;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.service.InventoryService;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final InventoryRepository inventoryRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Transactional
    public Inventory createFor(Product product, Integer initialQuantity, Integer reorderLevel, String warehouseLocation) {
        Inventory inventory = Inventory.builder()
                .product(product)
                .quantityOnHand(initialQuantity != null ? initialQuantity : 0)
                .reorderLevel(reorderLevel != null ? reorderLevel : 10)
                .warehouseLocation(warehouseLocation)
                .build();
        return inventoryRepository.save(inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryResponse getByProductId(Long productId) {
        Inventory inventory = findByProductOrThrow(productId);
        return ProductMapper.toInventoryResponse(inventory.getProduct(), inventory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryResponse> findLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(inv -> ProductMapper.toInventoryResponse(inv.getProduct(), inv))
                .toList();
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Transactional
    public InventoryResponse adjust(Long productId, int delta, String reason) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));

        int newQuantity = inventory.getQuantityOnHand() + delta;
        if (newQuantity < 0) {
            throw new InsufficientStockException(
                    "Adjustment would result in negative stock for product " + productId
                            + " (current=" + inventory.getQuantityOnHand() + ", delta=" + delta + ")");
        }
        inventory.setQuantityOnHand(newQuantity);
        Inventory saved = inventoryRepository.save(inventory);
        log.info("Inventory adjusted for product {}: delta={}, newQuantity={}, reason={}",
                productId, delta, newQuantity, reason);
        return ProductMapper.toInventoryResponse(saved.getProduct(), saved);
    }

    @Override
    @Transactional
    public void reserveStock(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));

        if (inventory.getQuantityOnHand() < quantity) {
            throw new InsufficientStockException(
                    "Insufficient stock for product " + productId
                            + " (requested=" + quantity + ", available=" + inventory.getQuantityOnHand() + ")");
        }
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional
    public void releaseStock(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
        inventoryRepository.save(inventory);
    }

    private Inventory findByProductOrThrow(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Inventory for product", productId));
    }
}
