package com.gowrisankar.retailreporting.service.reporting.impl;

import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.report.ReportGranularity;
import com.gowrisankar.retailreporting.dto.report.RevenueTrendPoint;
import com.gowrisankar.retailreporting.dto.report.SalesSummary;
import com.gowrisankar.retailreporting.dto.report.TopProductPoint;
import com.gowrisankar.retailreporting.repository.OrderItemRepository;
import com.gowrisankar.retailreporting.repository.OrderRepository;
import com.gowrisankar.retailreporting.service.reporting.SalesReportService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Revenue-trend bucketing is done in Java over the fetched order set rather than with a
 * database-side {@code date_trunc}/{@code GROUP BY} - this keeps the exact same code
 * path portable between PostgreSQL (prod) and H2 (tests), at the cost of pulling the
 * order rows into the app tier. See docs/architecture.md and ROADMAP.md for the
 * materialized-view migration path once order volume makes that trade-off wrong.
 */
@Service
public class SalesReportServiceImpl implements SalesReportService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public SalesReportServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummary getSummary(LocalDateTime start, LocalDateTime end) {
        BigDecimal revenue = orderRepository.sumRevenue(start, end, OrderStatus.CANCELLED);
        long count = orderRepository.countInRange(start, end, OrderStatus.CANCELLED);
        return SalesSummary.of(revenue, count);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueTrendPoint> getRevenueTrend(LocalDateTime start, LocalDateTime end, ReportGranularity granularity) {
        List<Order> orders = orderRepository.findByOrderDateBetweenAndStatusNot(start, end, OrderStatus.CANCELLED);

        Map<String, BigDecimal> revenueByPeriod = new LinkedHashMap<>();
        Map<String, Long> countByPeriod = new LinkedHashMap<>();

        orders.stream()
                .sorted(Comparator.comparing(Order::getOrderDate))
                .forEach(order -> {
                    String period = order.getOrderDate().format(granularity.formatter());
                    revenueByPeriod.merge(period, order.getTotalAmount(), BigDecimal::add);
                    countByPeriod.merge(period, 1L, Long::sum);
                });

        return revenueByPeriod.entrySet().stream()
                .map(e -> new RevenueTrendPoint(e.getKey(), e.getValue(), countByPeriod.get(e.getKey())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductPoint> getTopProductsByQuantity(LocalDateTime start, LocalDateTime end, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderItemRepository.findTopProductsByQuantity(start, end, OrderStatus.CANCELLED, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductPoint> getTopProductsByRevenue(LocalDateTime start, LocalDateTime end, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return orderItemRepository.findTopProductsByRevenue(start, end, OrderStatus.CANCELLED, pageable);
    }
}
