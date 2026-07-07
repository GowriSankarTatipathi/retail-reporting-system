package com.gowrisankar.retailreporting.service.impl;

import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.report.DashboardSummary;
import com.gowrisankar.retailreporting.dto.report.SalesSummary;
import com.gowrisankar.retailreporting.repository.InventoryRepository;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.service.DashboardService;
import com.gowrisankar.retailreporting.service.reporting.SalesReportService;
import java.time.LocalDateTime;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backs the single most frequently hit read endpoint in the API (a dashboard is, by
 * nature, polled repeatedly) - see {@code CacheConfig} for the 5-minute TTL applied to
 * the {@code dashboardSummary} cache. Staleness up to that TTL is an accepted trade-off
 * for KPI-level figures; see docs/architecture.md.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private final SalesReportService salesReportService;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public DashboardServiceImpl(SalesReportService salesReportService,
                                 OrderRepository orderRepository,
                                 InventoryRepository inventoryRepository) {
        this.salesReportService = salesReportService;
        this.orderRepository = orderRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    @Cacheable(value = "dashboardSummary", key = "#lookbackDays")
    @Transactional(readOnly = true)
    public DashboardSummary getSummary(int lookbackDays) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(lookbackDays);

        SalesSummary sales = salesReportService.getSummary(start, end);
        long activeCustomers = orderRepository.countDistinctCustomersInRange(start, end, OrderStatus.CANCELLED);
        long lowStockCount = inventoryRepository.findLowStock().size();

        return new DashboardSummary(
                sales.totalRevenue(),
                sales.totalOrders(),
                sales.averageOrderValue(),
                activeCustomers,
                lowStockCount,
                LocalDateTime.now()
        );
    }
}
