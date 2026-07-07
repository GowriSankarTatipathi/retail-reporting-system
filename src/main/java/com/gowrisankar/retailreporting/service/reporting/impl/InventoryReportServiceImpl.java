package com.gowrisankar.retailreporting.service.reporting.impl;

import com.gowrisankar.retailreporting.domain.entity.Inventory;
import com.gowrisankar.retailreporting.dto.report.LowStockItem;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.service.reporting.InventoryReportService;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryReportServiceImpl implements InventoryReportService {

    private final InventoryRepository inventoryRepository;

    public InventoryReportServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Cached for 2 minutes ({@code CacheConfig}) - inventory changes more often than
     * dashboard-level KPIs, so this report gets a shorter TTL rather than active
     * cache eviction on every stock mutation (a deliberate staleness-vs-complexity
     * trade-off; see docs/architecture.md).
     */
    @Override
    @Cacheable("lowStockReport")
    @Transactional(readOnly = true)
    public List<LowStockItem> getLowStockItems() {
        return inventoryRepository.findLowStock().stream()
                .map(this::toLowStockItem)
                .toList();
    }

    private LowStockItem toLowStockItem(Inventory inventory) {
        return new LowStockItem(
                inventory.getProduct().getId(),
                inventory.getProduct().getSku(),
                inventory.getProduct().getName(),
                inventory.getProduct().getCategory().getName(),
                inventory.getQuantityOnHand(),
                inventory.getReorderLevel(),
                inventory.getWarehouseLocation()
        );
    }
}
