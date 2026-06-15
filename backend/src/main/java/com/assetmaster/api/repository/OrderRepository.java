package com.assetmaster.api.repository;

import com.assetmaster.api.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items", "items.asset", "items.asset.author", "items.asset.category"})
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    @EntityGraph(attributePaths = {"items", "items.asset", "items.asset.author", "items.asset.category"})
    Optional<Order> findByIdAndBuyerId(Long id, Long buyerId);

    long countByStatus(com.assetmaster.api.entity.OrderStatus status);
}
