package com.assetmaster.api.repository;

import com.assetmaster.api.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END " +
           "FROM OrderItem oi WHERE oi.order.buyer.id = :buyerId AND oi.asset.id = :assetId")
    boolean existsByBuyerIdAndAssetId(@Param("buyerId") Long buyerId, @Param("assetId") Long assetId);
}
