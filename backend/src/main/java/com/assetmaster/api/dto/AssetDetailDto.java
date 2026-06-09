package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Asset;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AssetDetailDto(
        Long id,
        String title,
        String description,
        List<String> previewUrls,
        Long authorId,
        String authorName,
        String authorAvatarUrl,
        Long categoryId,
        String categoryName,
        String categorySlug,
        BigDecimal price,
        String licenseType,
        String status,
        String[] tags,
        int downloadsCount,
        int viewsCount,
        OffsetDateTime createdAt
) {
    public static AssetDetailDto fromEntity(Asset a) {
        return new AssetDetailDto(
                a.getId(),
                a.getTitle(),
                a.getDescription(),
                a.getPreviewUrls(),
                a.getAuthor().getId(),
                a.getAuthor().getDisplayName(),
                a.getAuthor().getAvatarUrl(),
                a.getCategory() != null ? a.getCategory().getId() : null,
                a.getCategory() != null ? a.getCategory().getName() : null,
                a.getCategory() != null ? a.getCategory().getSlug() : null,
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
