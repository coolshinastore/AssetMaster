package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Review;

import java.time.OffsetDateTime;

public record ReviewDto(
        Long id,
        Long authorId,
        String authorName,
        String authorAvatarUrl,
        int rating,
        String comment,
        OffsetDateTime createdAt
) {
    public static ReviewDto fromEntity(Review r) {
        return new ReviewDto(
                r.getId(),
                r.getAuthor().getId(),
                r.getAuthor().getDisplayName(),
                r.getAuthor().getAvatarUrl(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}
