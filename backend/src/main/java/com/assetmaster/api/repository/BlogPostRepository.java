package com.assetmaster.api.repository;

import com.assetmaster.api.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    @EntityGraph(attributePaths = {"author"})
    Page<BlogPost> findByPublishedTrueOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"author"})
    Optional<BlogPost> findBySlugAndPublishedTrue(String slug);

    @EntityGraph(attributePaths = {"author"})
    Page<BlogPost> findAll(Pageable pageable);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
