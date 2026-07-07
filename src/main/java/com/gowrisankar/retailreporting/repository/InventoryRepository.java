package com.gowrisankar.retailreporting.repository;

import com.gowrisankar.retailreporting.domain.entity.Inventory;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    /**
     * Locks the inventory row for the duration of the enclosing transaction so
     * concurrent order placements cannot both read the same (stale) quantity and
     * oversell the same product. See docs/architecture.md §10 (Transaction Boundaries).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventory i where i.product.id = :productId")
    Optional<Inventory> findByProductIdForUpdate(@Param("productId") Long productId);

    @Query("select i from Inventory i where i.quantityOnHand <= i.reorderLevel")
    List<Inventory> findLowStock();
}
