package com.assetmaster.api.dto;

import com.assetmaster.api.entity.BlogPost;

import java.time.Instant;

public record BlogPostDto(
        Long id,
        String slug,
        String tag,
        String title,
        String excerpt,
        String content,
        boolean published,
        String readTime,
        String authorName,
        Instant createdAt,
        Instant updatedAt
) {
    public static BlogPostDto from(BlogPost p) {
        return new BlogPostDto(
                p.getId(), p.getSlug(), p.getTag(), p.getTitle(), p.getExcerpt(),
                p.getContent(), p.isPublished(), p.getReadTime(),
                p.getAuthor() != null ? p.getAuthor().getDisplayName() : null,
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
