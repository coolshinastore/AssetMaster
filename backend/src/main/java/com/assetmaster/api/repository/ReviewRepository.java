package com.assetmaster.api.repository;

import com.assetmaster.api.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"author"})
    Page<Review> findByAssetIdOrderByCreatedAtDesc(Long assetId, Pageable pageable);

    boolean existsByAssetIdAndAuthorId(Long assetId, Long authorId);

    long countByAssetId(Long assetId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.asset.id = :assetId")
    Double findAverageRatingByAssetId(@Param("assetId") Long assetId);
}
