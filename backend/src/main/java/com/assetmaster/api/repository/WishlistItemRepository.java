package com.assetmaster.api.repository;

import com.assetmaster.api.entity.WishlistItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"asset", "asset.author", "asset.category"})
    List<WishlistItem> findByUserId(Long userId);

    boolean existsByUserIdAndAssetId(Long userId, Long assetId);

    @Modifying
    @Transactional
    void deleteByUserIdAndAssetId(Long userId, Long assetId);
}
