package com.gowrisankar.retailreporting.repository;

import com.gowrisankar.retailreporting.domain.entity.OrderItem;
import com.gowrisankar.retailreporting.domain.entity.OrderStatus;
import com.gowrisankar.retailreporting.dto.report.TopProductPoint;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
            select new com.gowrisankar.retailreporting.dto.report.TopProductPoint(
                p.id, p.sku, p.name, sum(oi.quantity), sum(oi.subtotal))
            from OrderItem oi
            join oi.product p
            join oi.order o
            where o.orderDate between :start and :end and o.status <> :excludedStatus
            group by p.id, p.sku, p.name
            order by sum(oi.quantity) desc
            """)
    List<TopProductPoint> findTopProductsByQuantity(@Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end,
                                                      @Param("excludedStatus") OrderStatus excludedStatus,
                                                      Pageable pageable);

    @Query("""
            select new com.gowrisankar.retailreporting.dto.report.TopProductPoint(
                p.id, p.sku, p.name, sum(oi.quantity), sum(oi.subtotal))
            from OrderItem oi
            join oi.product p
            join oi.order o
            where o.orderDate between :start and :end and o.status <> :excludedStatus
            group by p.id, p.sku, p.name
            order by sum(oi.subtotal) desc
            """)
    List<TopProductPoint> findTopProductsByRevenue(@Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end,
                                                     @Param("excludedStatus") OrderStatus excludedStatus,
                                                     Pageable pageable);
}
