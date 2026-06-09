package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Asset;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AuthorAssetDto(
        Long id,
        String title,
        String thumbnailUrl,
        Long categoryId,
        String categoryName,
        BigDecimal price,
        String licenseType,
        String status,
        String[] tags,
        int downloadsCount,
        int viewsCount,
        OffsetDateTime createdAt
) {
    public static AuthorAssetDto fromEntity(Asset a) {
        String thumb = (a.getPreviewUrls() != null && !a.getPreviewUrls().isEmpty())
                ? a.getPreviewUrls().get(0) : null;
        return new AuthorAssetDto(
                a.getId(),
                a.getTitle(),
                thumb,
                a.getCategory() != null ? a.getCategory().getId() : null,
                a.getCategory() != null ? a.getCategory().getName() : null,
                a.getPrice(),
                a.getLicenseType().name(),
                a.getStatus().name(),
                a.getTags(),
                a.getDownloadsCount(),
                a.getViewsCount(),
                a.getCreatedAt()
        );
    }
}
