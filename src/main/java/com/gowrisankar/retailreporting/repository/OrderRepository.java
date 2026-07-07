package com.gowrisankar.retailreporting.repository;

import com.gowrisankar.retailreporting.domain.entity.Order;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.report.TopCustomerPoint;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    /**
     * Orders in a date range, excluding a given status (typically CANCELLED). Revenue
     * trend aggregation is done in {@code SalesReportService} using Java streams rather
     * than DB-side date-bucketing (e.g. Postgres {@code date_trunc}) so the same code
     * path works identically against H2 in tests and PostgreSQL in production. See
     * docs/architecture.md for the trade-off discussion and the materialized-view
     * migration path noted in ROADMAP.md for when order volume outgrows this approach.
     */
    List<Order> findByOrderDateBetweenAndStatusNot(LocalDateTime start, LocalDateTime end, OrderStatus excludedStatus);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o "
            + "where o.orderDate between :start and :end and o.status <> :excludedStatus")
    BigDecimal sumRevenue(@Param("start") LocalDateTime start,
                          @Param("end") LocalDateTime end,
                          @Param("excludedStatus") OrderStatus excludedStatus);

    @Query("select count(o) from Order o "
            + "where o.orderDate between :start and :end and o.status <> :excludedStatus")
    long countInRange(@Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end,
                       @Param("excludedStatus") OrderStatus excludedStatus);

    @Query("""
            select new com.gowrisankar.retailreporting.dto.report.TopCustomerPoint(
                c.id, concat(c.firstName, ' ', c.lastName), c.email, sum(o.totalAmount), count(o))
            from Order o join o.customer c
            where o.orderDate between :start and :end and o.status <> :excludedStatus
            group by c.id, c.firstName, c.lastName, c.email
            order by sum(o.totalAmount) desc
            """)
    List<TopCustomerPoint> findTopCustomers(@Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end,
                                             @Param("excludedStatus") OrderStatus excludedStatus,
                                             Pageable pageable);

    @Query("select count(distinct o.customer.id) from Order o "
            + "where o.orderDate between :start and :end and o.status <> :excludedStatus")
    long countDistinctCustomersInRange(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end,
                                        @Param("excludedStatus") OrderStatus excludedStatus);
}
