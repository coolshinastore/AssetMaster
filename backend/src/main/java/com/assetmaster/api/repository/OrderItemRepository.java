package com.assetmaster.api.repository;

import com.assetmaster.api.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END " +
           "FROM OrderItem oi WHERE oi.order.buyer.id = :buyerId AND oi.asset.id = :assetId")
    boolean existsByBuyerIdAndAssetId(@Param("buyerId") Long buyerId, @Param("assetId") Long assetId);

    @Query("SELECT COALESCE(SUM(oi.priceAtPurchase), 0) FROM OrderItem oi " +
           "WHERE oi.asset.author.id = :authorId AND oi.order.status = 'PAID'")
    BigDecimal sumEarningsByAuthorId(@Param("authorId") Long authorId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi " +
           "WHERE oi.asset.author.id = :authorId AND oi.order.status = 'PAID'")
    long countSalesByAuthorId(@Param("authorId") Long authorId);

    @Query(nativeQuery = true, value = """
            SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS month,
                   COUNT(oi.id)                     AS sales_count,
                   COALESCE(SUM(oi.price_at_purchase), 0) AS earnings
            FROM order_items oi
            JOIN orders o  ON oi.order_id  = o.id
            JOIN assets a  ON oi.asset_id  = a.id
            WHERE a.author_id = :authorId AND o.status = 'PAID'
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
            """)
    List<Object[]> findMonthlySalesByAuthorId(@Param("authorId") Long authorId);

    @Query(nativeQuery = true, value = """
            SELECT a.id,
                   a.title,
                   COUNT(oi.id)                     AS sales_count,
                   COALESCE(SUM(oi.price_at_purchase), 0) AS earnings
            FROM order_items oi
            JOIN assets a ON oi.asset_id = a.id
            JOIN orders o ON oi.order_id = o.id
            WHERE a.author_id = :authorId AND o.status = 'PAID'
            GROUP BY a.id, a.title
            ORDER BY earnings DESC
            LIMIT 10
            """)
    List<Object[]> findTopAssetsByAuthorId(@Param("authorId") Long authorId);
}
