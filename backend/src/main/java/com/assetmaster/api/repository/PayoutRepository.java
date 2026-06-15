package com.assetmaster.api.repository;

import com.assetmaster.api.entity.Payout;
import com.assetmaster.api.entity.PayoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayoutRepository extends JpaRepository<Payout, Long> {

    List<Payout> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @EntityGraph(attributePaths = {"author"})
    Page<Payout> findAll(Pageable pageable);

    long countByStatus(PayoutStatus status);
}
