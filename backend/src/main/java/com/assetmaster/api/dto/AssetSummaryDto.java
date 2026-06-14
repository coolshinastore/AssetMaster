package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Asset;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AssetSummaryDto(
        Long id,
        String title,
        String thumbnailUrl,
        Long authorId,
        String authorName,
        String authorAvatarUrl,
        boolean authorVerified,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        String licenseType,
        int downloadsCount,
        OffsetDateTime createdAt
) {
    public static AssetSummaryDto fromEntity(Asset a) {
        String thumb = (a.getPreviewUrls() != null && !a.getPreviewUrls().isEmpty())
                ? a.getPreviewUrls().get(0) : null;
        return new AssetSummaryDto(
                a.getId(),
                a.getTitle(),
                thumb,
                a.getAuthor().getId(),
                a.getAuthor().getDisplayName(),
                a.getAuthor().getAvatarUrl(),
                a.getAuthor().isVerified(),
                a.getCategory() != null ? a.getCategory().getId() : null,
                a.getCategory() != null ? a.getCategory().getName() : null,
                a.getPrice(),
                a.getLicenseType().name(),
                a.getDownloadsCount(),
                a.getCreatedAt()
        );
    }
}
