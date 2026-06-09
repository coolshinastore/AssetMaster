package com.assetmaster.api.repository;

import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    @EntityGraph(attributePaths = {"author", "category"})
    @Override
    Page<Asset> findAll(@Nullable Specification<Asset> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    Page<Asset> findByStatus(AssetStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT a FROM Asset a WHERE a.status = :status AND LOWER(a.title) LIKE :pattern")
    Page<Asset> searchByTitle(@Param("status") AssetStatus status,
                              @Param("pattern") String pattern,
                              Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    java.util.List<Asset> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    long countByCategoryIdAndStatus(Long categoryId, AssetStatus status);
}
