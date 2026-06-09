package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Asset;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AdminAssetDto(
        Long id,
        String title,
        String description,
        Long authorId,
        String authorEmail,
        String authorName,
        String categoryName,
        BigDecimal price,
        String status,
        String rejectionReason,
        List<String> previewUrls,
        String[] tags,
        OffsetDateTime createdAt
) {
    public static AdminAssetDto fromEntity(Asset a) {
        return new AdminAssetDto(
                a.getId(),
                a.getTitle(),
                a.getDescription(),
                a.getAuthor().getId(),
                a.getAuthor().getEmail(),
                a.getAuthor().getDisplayName(),
                a.getCategory() != null ? a.getCategory().getName() : null,
                a.getPrice(),
                a.getStatus().name(),
                a.getRejectionReason(),
                a.getPreviewUrls(),
                a.getTags(),
                a.getCreatedAt()
        );
    }
}
